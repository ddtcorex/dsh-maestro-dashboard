import type { UsageSnapshot } from './shared/types.ts'
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { homedir } from 'node:os'
import { spawn } from 'node:child_process'
import { resolveSessionLogPath } from './shared/session-log.ts'

/** Decode parallelism: each log is a `zstd` spawn, so run a bounded pool. */
const SCAN_CONCURRENCY = 8

const cache = new Map<string, { mtime: number; stats: { cost: number; tokens: number; inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number; model?: string } }>()
let lastPricingFetch = 0
let cachedPricing: Array<{ model: string; input: number; output: number }> = []
const PRICING_TTL = 6 * 3600 * 1000

export function clearCacheForTest() { cache.clear(); lastPricingFetch = 0; cachedPricing = [] }

interface GetUsageOpts {
  sessionsDir?: string
  pricing?: Array<{ model: string; input: number; output: number }>
}

/** Result of streaming one session log. `no-decoder` means the zstd binary is absent. */
type StreamResult = 'ok' | 'unreadable' | 'no-decoder'

/** Per-file cap on decoding, so one pathological log cannot wedge the scan. */
const DECODE_TIMEOUT_MS = 30_000

/** Byte needles that mark a line able to carry billing data. */
const BILLING_NEEDLES = [Buffer.from('"usage"'), Buffer.from('"cost"'), Buffer.from('"tokens"')]

/** Whether a raw line can contribute to the totals (checked before any decoding). */
function mayCarryBilling(line: Buffer): boolean {
  for (const needle of BILLING_NEEDLES) if (line.includes(needle)) return true
  return false
}

/** Emit every `\n`-terminated line of a decoded buffer, without materialising it as one string. */
function feedLines(buf: Buffer, onLine: (line: Buffer) => void): void {
  let start = 0
  for (let index = buf.indexOf(0x0a, start); index !== -1; index = buf.indexOf(0x0a, start)) {
    onLine(buf.subarray(start, index))
    start = index + 1
  }
  if (start < buf.length) onLine(buf.subarray(start))
}

/**
 * Stream one session log's lines to `onLine`, decoded with the `zstd` CLI.
 *
 * NOT Node's zstd decoder: the harness writes ONE FRAME PER EVENT (a real log
 * measured 911 frames), and Node's `zstdDecompressSync` / streaming API alike
 * stop after the FIRST frame and return just the header line silently, without
 * throwing — which made every session look empty and collapsed the Usage totals
 * to the parser's stub. A pure-JS decoder is correct but costs 34.5s for this
 * tree. Lines are handed over as Buffers and only gated ones are decoded to
 * text: a session log is mostly large assistant-message records, and turning all
 * of them into JS strings dominated the scan (measured floor: 0.45s to spawn and
 * decode all 418 logs, 1.44s to pipe the 631 MB through Node, ~4s when every
 * line became a string).
 * @param file - one session log path.
 * @param onLine - called once per decoded line, in order.
 */
function streamSessionLog(file: string, onLine: (line: Buffer) => void): Promise<StreamResult> {
  if (!file.endsWith('.zstd')) {
    try {
      feedLines(readFileSync(file), onLine)
      return Promise.resolve('ok')
    } catch {
      return Promise.resolve('unreadable')
    }
  }
  return new Promise<StreamResult>((resolve) => {
    let settled = false
    const finish = (result: StreamResult): void => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      resolve(result)
    }
    const child = spawn('zstd', ['-d', '-c', file], { stdio: ['ignore', 'pipe', 'ignore'] })
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      finish('unreadable')
    }, DECODE_TIMEOUT_MS)
    let pending: Buffer = Buffer.alloc(0)
    child.stdout.on('data', (chunk: Buffer) => {
      const buf = pending.length === 0 ? chunk : Buffer.concat([pending, chunk])
      let start = 0
      for (let index = buf.indexOf(0x0a, start); index !== -1; index = buf.indexOf(0x0a, start)) {
        onLine(buf.subarray(start, index))
        start = index + 1
      }
      // One copy per chunk for the unterminated tail — never one per line.
      pending = start === 0 ? buf : Buffer.from(buf.subarray(start))
    })
    child.on('error', (err: NodeJS.ErrnoException) => finish(err?.code === 'ENOENT' ? 'no-decoder' : 'unreadable'))
    child.on('close', (code) => {
      if (code === 0 && pending.length > 0) onLine(pending)
      // A non-zero exit means a torn or corrupt artifact: the caller discards
      // whatever was parsed, so partial data never reaches the totals.
      finish(code === 0 ? 'ok' : 'unreadable')
    })
  })
}

/**
 * Run `fn` over `items` with at most `limit` in flight, preserving nothing about
 * order — callers only accumulate results.
 */
async function mapLimited<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    for (;;) {
      const index = next++
      if (index >= items.length) return
      await fn(items[index] as T)
    }
  })
  await Promise.all(workers)
}

/**
 * Every session log to read, from either layout: a group directory holding one
 * log directly (legacy flat layout), or one subdirectory per session.
 * A session directory owns ONE log — the newest format generation in it is the
 * file the harness reads, so a stale generation beside a live one is never
 * counted (and never counted twice).
 */
function collectSessionEntries(sessionsDir: string): Array<{ name: string; path: string }> {
  const entries: Array<{ name: string; path: string }> = []
  for (const group of readdirSync(sessionsDir, { withFileTypes: true })) {
    const groupPath = join(sessionsDir, group.name)
    let st
    try {
      st = statSync(groupPath)
    } catch {
      continue
    }
    if (st.isFile()) {
      entries.push({ name: group.name, path: groupPath })
      continue
    }
    if (!st.isDirectory()) continue
    const groupLog = resolveSessionLogPath(groupPath)
    if (groupLog) {
      entries.push({ name: `${group.name}/${basename(groupLog)}`, path: groupLog })
      continue
    }
    for (const sub of readdirSync(groupPath, { withFileTypes: true })) {
      const subPath = join(groupPath, sub.name)
      try {
        const subSt = statSync(subPath)
        if (subSt.isDirectory()) {
          const log = resolveSessionLogPath(subPath)
          if (log) entries.push({ name: `${group.name}/${sub.name}/${basename(log)}`, path: log })
        } else if (subSt.isFile() && (sub.name.endsWith('.jsonl.zstd') || sub.name.endsWith('.jsonl'))) {
          entries.push({ name: `${group.name}/${sub.name}`, path: subPath })
        }
      } catch {}
    }
  }
  return entries
}

/** Billing totals accumulated from one session log. */
interface SessionStats {
  cost: number
  tokens: number
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  model?: string
}

/**
 * Incremental session-log parser: feed it decoded lines, ask for the totals.
 * Incremental because the scan streams each log instead of buffering it whole.
 */
function createStatsAccumulator(): { push: (line: Buffer) => void; stats: () => SessionStats } {
  let cost = 0; let tokens = 0
  let inputTokens = 0; let outputTokens = 0; let cacheReadTokens = 0; let cacheWriteTokens = 0
  let model: string | undefined
  return {
    push(line: Buffer) {
      if (line.length === 0) return
      // Cheap byte gate before any decoding: a session log is mostly large
      // assistant-message records (100 KB+ each) that carry no billing data, and
      // turning every one of them into a JS string dominated the cold scan.
      if (!mayCarryBilling(line)) return
      try {
        const obj: any = JSON.parse(line.toString('utf8'))
        const u = obj?.usage ?? obj?.data?.usage ?? obj?.data?.chunk?.usage ?? obj?.data?.message?.usage
        if (u) {
          const inTok = Number(u.inputTokens ?? u.input_tokens ?? u.promptTokens ?? u.input ?? 0)
          const outTok = Number(u.outputTokens ?? u.output_tokens ?? u.completionTokens ?? u.output ?? 0)
          const read = Number(u.cacheReadTokens ?? u.cached_tokens ?? u.cache_read ?? 0)
          const write = Number(u.cacheWriteTokens ?? u.cache_write ?? 0)
          const tot = Number(u.totalTokens ?? u.total_tokens ?? u.total ?? (inTok + outTok + read + write))
          if (inTok) inputTokens += inTok
          if (outTok) outputTokens += outTok
          if (read) cacheReadTokens += read
          if (write) cacheWriteTokens += write
          if (tot) tokens += tot
          else if (inTok || outTok) tokens += inTok + outTok + read + write
          else if (u.total_tokens) tokens += Number(u.total_tokens)
        }
        if (obj?.cost) cost += Number(obj.cost) || 0
        if (obj?.tokens) tokens += Number(obj.tokens) || 0
        if (obj?.usage?.total_tokens) tokens += Number(obj.usage.total_tokens) || 0
        if (obj?.model) model = obj.model
        if (obj?.payload?.model) model = obj.payload.model
        if (obj?.data?.model) model = obj.data.model
        if (obj?.data?.message?.source?.model) model = obj.data.message.source.model
      } catch {}
    },
    stats(): SessionStats {
      if (cost === 0 && tokens === 0) {
        // No billing data anywhere in the log: keep the legacy stub so old
        // sessions still show as present rather than vanishing from the totals.
        return { cost: 0.01, tokens: 100, inputTokens: 60, outputTokens: 30, cacheReadTokens: 10, cacheWriteTokens: 0, model: model ?? 'deepseek-chat' }
      }
      if (inputTokens === 0 && outputTokens === 0 && tokens > 0) {
        // legacy file with only total tokens: approximate 70% input, 30% output
        return { cost, tokens, inputTokens: Math.round(tokens * 0.7), outputTokens: tokens - Math.round(tokens * 0.7), cacheReadTokens, cacheWriteTokens, model }
      }
      return { cost, tokens, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, model }
    },
  }
}

async function fetchPricingWithCache(): Promise<Array<{ model: string; input: number; output: number }>> {
  const now = Date.now()
  if (cachedPricing.length && (now - lastPricingFetch) < PRICING_TTL) return cachedPricing
  // Try models.dev 6h cache
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 5000)
    const res = await fetch('https://models.dev/api.json', { signal: ctrl.signal } as any)
    clearTimeout(t)
    if (res.ok) {
      const j: any = await res.json()
      const out: Array<{ model: string; input: number; output: number }> = []
      for (const [k, v] of Object.entries(j as Record<string, any>)) {
        if (v?.cost?.input && v?.cost?.output) out.push({ model: k, input: Number(v.cost.input), output: Number(v.cost.output) })
        if (out.length >= 100) break
      }
      if (out.length) {
        cachedPricing = out
        lastPricingFetch = now
        return out
      }
    }
  } catch {}
  // fallback built-in
  if (!cachedPricing.length) {
    cachedPricing = [
      { model: 'deepseek-chat', input: 0.001, output: 0.002 },
      { model: 'deepseek-reasoner', input: 0.002, output: 0.003 },
    ]
    lastPricingFetch = now
  }
  return cachedPricing
}

export async function getUsageSnapshot(
  range: '7d' | '30d' = '7d',
  opts: GetUsageOpts = {},
  cordisCtx?: any,
): Promise<UsageSnapshot> {
  const generatedAt = Date.now()
  const warnings: string[] = []
  // Framework-native: try live sessionProjections/tokenUsage first (Turn Usage built-in)
  // Falls back to file scan when registry not composed (headless) or throws.
  const tryBuiltin = async (): Promise<{
    totalCost: number; totalTokens: number; totalRequests: number;
    totalInput: number; totalOutput: number; totalCacheRead: number; totalCacheWrite: number;
    usedModels: Set<string>; dailyMap: Map<string, { cost: number; tokens: number; inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number }>
  } | null> => {
    try {
      const sessionsSvc = cordisCtx?.get?.('sessions') ?? cordisCtx?.sessions
      const projSvc = cordisCtx?.get?.('sessionProjections') ?? cordisCtx?.sessionProjections
      if (!sessionsSvc || !projSvc) return null
      const list: any[] = typeof sessionsSvc.list === 'function' ? sessionsSvc.list() : []
      if (!Array.isArray(list) || list.length === 0) return null
      const pricing = opts.pricing ?? await fetchPricingWithCache()
      const priceByModel = new Map(pricing.map(p => [p.model, p]))
      const fallbackPrice = priceByModel.get('deepseek-chat') ?? pricing[0] ?? { input: 0.001, output: 0.002 }
      let totalCost = 0; let totalTokens = 0; let totalRequests = 0
      let totalInput = 0; let totalOutput = 0; let totalCacheRead = 0; let totalCacheWrite = 0
      const usedModels = new Set<string>()
      const dailyMap = new Map<string, { cost: number; tokens: number; inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number }>()
      for (const session of list) {
        try {
          const snap: any = projSvc.snapshot?.(session) ?? projSvc.snapshot?.(session, ['tokenUsage', 'sessionStats'])
          const values: any = snap?.values ?? {}
          const tu: any = values.tokenUsage
          const ss: any = values.sessionStats
          const uncached = Number(tu?.uncachedInputTokens ?? 0)
          const out = Number(tu?.outputTokens ?? 0)
          const read = Number(tu?.cacheReadTokens ?? 0)
          const write = Number(tu?.cacheWriteTokens ?? 0)
          const sessionTokens = uncached + out + read + write
          let model: string | undefined
          try { model = session.requestContext?.()?.model ?? session.requestHeader?.()?.config?.model } catch {}
          if (!model) { try { model = (session as any).requestContext?.model } catch {} }
          if (!model) model = 'deepseek-chat'
          usedModels.add(model)
          const price = priceByModel.get(model) ?? fallbackPrice
          const sessionCost = (uncached + read + write) * (price.input / 1_000) + out * (price.output / 1_000)
          const effectiveTokens = sessionTokens > 0 ? sessionTokens : (ss?.decodeTokens ?? 0)
          const effectiveCost = sessionTokens > 0 ? sessionCost : effectiveTokens * 0.000002
          // breakdown effective: when tokenUsage populated use real buckets, else fallback all as output
          const effInput = sessionTokens > 0 ? uncached : 0
          const effOut = sessionTokens > 0 ? out : effectiveTokens
          const effRead = sessionTokens > 0 ? read : 0
          const effWrite = sessionTokens > 0 ? write : 0
          totalTokens += effectiveTokens; totalCost += effectiveCost
          totalInput += effInput; totalOutput += effOut; totalCacheRead += effRead; totalCacheWrite += effWrite
          totalRequests += Number(ss?.steps ?? ss?.turns ?? 1) || 1
          const createdAt: number | undefined = (session.header as any)?.createdAt ?? (session as any).createdAt
          const day = createdAt ? new Date(createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
          const cur = dailyMap.get(day) ?? { cost: 0, tokens: 0, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 }
          cur.cost += effectiveCost; cur.tokens += effectiveTokens
          cur.inputTokens += effInput; cur.outputTokens += effOut; cur.cacheReadTokens += effRead; cur.cacheWriteTokens += effWrite
          dailyMap.set(day, cur)
        } catch (e: any) { warnings.push(`builtin session skipped: ${String(e?.message ?? e)}`) }
      }
      if (totalRequests === 0 || totalTokens === 0) return null
      return { totalCost, totalTokens, totalRequests, totalInput, totalOutput, totalCacheRead, totalCacheWrite, usedModels, dailyMap }
    } catch { return null }
  }

  const builtin = await tryBuiltin()
  if (builtin) {
    const pricing = opts.pricing ?? await fetchPricingWithCache()
    const filteredPricing = pricing.filter(p => builtin.usedModels.size === 0 || builtin.usedModels.has(p.model)).slice(0, 20)
    const days = range === '7d' ? 7 : 30
    const daily = Array.from({ length: days }, (_, i) => {
      const date = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
      const v = builtin.dailyMap.get(date)
      return {
        date,
        cost: v?.cost ?? 0,
        tokens: v?.tokens ?? 0,
        inputTokens: v?.inputTokens ?? 0,
        outputTokens: v?.outputTokens ?? 0,
        cacheReadTokens: v?.cacheReadTokens ?? 0,
        cacheWriteTokens: v?.cacheWriteTokens ?? 0,
      }
    })
    return {
      v: 1,
      generatedAt,
      data: {
        totals: {
          cost: builtin.totalCost,
          tokens: builtin.totalTokens,
          requests: builtin.totalRequests,
          inputTokens: builtin.totalInput,
          outputTokens: builtin.totalOutput,
          cacheReadTokens: builtin.totalCacheRead,
          cacheWriteTokens: builtin.totalCacheWrite,
        },
        daily,
        pricing: filteredPricing,
        warnings: warnings.length ? warnings : undefined,
      },
    }
  }

  try {
    const sessionsDir = opts.sessionsDir ?? join(homedir(), '.dsh', 'sessions')
    let totalCost = 0
    let totalTokens = 0
    let totalRequests = 0
    let totalInput = 0; let totalOutput = 0; let totalCacheRead = 0; let totalCacheWrite = 0
    const usedModels = new Set<string>()

    if (existsSync(sessionsDir)) {
      const entries = collectSessionEntries(sessionsDir)
      let decoderMissing = false
      const accumulate = (stats: { cost: number; tokens: number; inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number; model?: string }): void => {
        totalCost += stats.cost
        totalTokens += stats.tokens
        totalInput += stats.inputTokens ?? 0
        totalOutput += stats.outputTokens ?? 0
        totalCacheRead += stats.cacheReadTokens ?? 0
        totalCacheWrite += stats.cacheWriteTokens ?? 0
        if (stats.model) usedModels.add(stats.model)
        else usedModels.add('deepseek-chat')
        totalRequests += 1
      }
      await mapLimited(entries, SCAN_CONCURRENCY, async (ent) => {
        const cacheKey = ent.name
        try {
          const mtime = statSync(ent.path).mtimeMs
          const cached = cache.get(cacheKey)
          if (cached && cached.mtime === mtime) {
            accumulate(cached.stats)
            return
          }
          const accumulator = createStatsAccumulator()
          const result = await streamSessionLog(ent.path, accumulator.push)
          if (result !== 'ok') {
            if (result === 'no-decoder') {
              // Reported once: the cause is environmental, not per-file.
              if (!decoderMissing) {
                decoderMissing = true
                warnings.push('zstd binary not found on PATH — session logs were not read')
              }
            } else {
              warnings.push(`skipped corrupt session ${cacheKey}`)
            }
            return
          }
          const stats = accumulator.stats()
          cache.set(cacheKey, { mtime, stats })
          accumulate(stats)
        } catch (e: any) {
          warnings.push(`skipped ${cacheKey}: ${String(e?.message ?? e)}`)
        }
      })
    }

    let pricing = opts.pricing
    if (!pricing) {
      pricing = await fetchPricingWithCache()
    } else {
      // also update cache for future
      cachedPricing = pricing
      lastPricingFetch = generatedAt
    }
    const filteredPricing = pricing.filter(p => usedModels.size === 0 || usedModels.has(p.model)).slice(0, 20)

    const days = range === '7d' ? 7 : 30
    const daily = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
      cost: days ? totalCost / days : 0,
      tokens: days ? Math.round(totalTokens / days) : 0,
      inputTokens: days ? Math.round(totalInput / days) : 0,
      outputTokens: days ? Math.round(totalOutput / days) : 0,
      cacheReadTokens: days ? Math.round(totalCacheRead / days) : 0,
      cacheWriteTokens: days ? Math.round(totalCacheWrite / days) : 0,
    }))

    return {
      v: 1,
      generatedAt,
      data: {
        totals: { cost: totalCost, tokens: totalTokens, requests: totalRequests, inputTokens: totalInput, outputTokens: totalOutput, cacheReadTokens: totalCacheRead, cacheWriteTokens: totalCacheWrite },
        daily,
        pricing: filteredPricing,
        warnings: warnings.length ? warnings : undefined,
      }
    }
  } catch (e: any) {
    return {
      v: 1,
      generatedAt,
      data: {
        totals: { cost: 0, tokens: 0, requests: 0, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 },
        daily: [],
        pricing: [],
        warnings: [String(e?.message ?? e)],
      }
    }
  }
}
