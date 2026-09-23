import type { UsageSnapshot } from './shared/types.ts'
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { homedir } from 'node:os'
import { spawn } from 'node:child_process'
import { resolveSessionLogPath } from './shared/session-log.ts'

/** Decode parallelism: each log is a `zstd` spawn, so run a bounded pool. */
const SCAN_CONCURRENCY = 8

/** One session's billing buckets, keyed by UTC day (`YYYY-MM-DD`). */
interface DayBucket {
  cost: number
  tokens: number
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
  requests: number
}

interface SessionStats {
  byDay: Record<string, DayBucket>
  /** Models seen in the log, so the pricing table can show only what was used. */
  models: string[]
  /** model -> tokens that could not be priced (no models.dev entry). */
  unpriced: Record<string, number>
}

const cache = new Map<string, { mtime: number; stats: SessionStats }>()

/** Token counts of one billed record. */
export interface TokenCounts {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
  total: number
}

/** One model's price, in USD per MILLION tokens (models.dev's unit). */
export interface ModelPrice {
  model: string
  input: number
  output: number
  cacheRead?: number
  cacheWrite?: number
}

let lastPricingFetch = 0
let cachedPricing: ModelPrice[] = []
const PRICING_TTL = 6 * 3600 * 1000

export function clearCacheForTest() { cache.clear(); lastPricingFetch = 0; cachedPricing = [] }

interface GetUsageOpts {
  sessionsDir?: string
  pricing?: ModelPrice[]
}

function emptyBucket(): DayBucket {
  return { cost: 0, tokens: 0, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, requests: 0 }
}

/** UTC day of a record timestamp, or `undefined` when it carries none. */
function dayOf(time: unknown): string | undefined {
  const ms = Number(time)
  if (!Number.isFinite(ms) || ms <= 0) return undefined
  return new Date(ms).toISOString().slice(0, 10)
}

/**
 * Normalise a model id for pricing lookup: drop any provider prefix and all
 * punctuation/case. Session logs record the bare model (`deepseek-v4.1-flash`)
 * while models.dev lists `deepseek-ai/DeepSeek-V4.1-Flash`.
 */
export function normalizeModelId(id: string): string {
  const tail = id.includes('/') ? id.slice(id.lastIndexOf('/') + 1) : id
  return tail.toLowerCase().replace(/[^a-z0-9]/g, '')
}

/**
 * Build the price table from a models.dev payload. Costs live under
 * `provider.models[model].cost`, NOT at the provider level — reading them one
 * level up (as this used to) yields an EMPTY table, which is why the Usage tab's
 * pricing list was always empty and no cost could be derived from tokens.
 *
 * Zero/zero entries are dropped: models.dev carries placeholder rows (a free
 * gateway aliasing `deepseek-v4.1-flash`) that would silently price everything
 * at $0. When several providers offer the same model, the cheapest non-zero
 * entry wins, then the cheaper output, then the provider name — deterministic.
 */
export function buildPriceTable(payload: unknown): ModelPrice[] {
  const byModel = new Map<string, ModelPrice & { provider: string }>()
  const providers = (payload ?? {}) as Record<string, { models?: Record<string, { cost?: Record<string, unknown> }> }>
  for (const [providerId, provider] of Object.entries(providers)) {
    for (const [modelId, model] of Object.entries(provider?.models ?? {})) {
      const cost = model?.cost
      if (!cost) continue
      const input = Number(cost.input ?? 0)
      const output = Number(cost.output ?? 0)
      if (!(input > 0) && !(output > 0)) continue
      const cacheRead = Number(cost.cache_read ?? 0)
      const cacheWrite = Number(cost.cache_write ?? 0)
      const entry: ModelPrice & { provider: string } = {
        model: modelId,
        input,
        output,
        cacheRead: cacheRead > 0 ? cacheRead : undefined,
        cacheWrite: cacheWrite > 0 ? cacheWrite : undefined,
        provider: providerId,
      }
      const key = normalizeModelId(modelId)
      const prev = byModel.get(key)
      const better = prev === undefined
        || entry.input < prev.input
        || (entry.input === prev.input && entry.output < prev.output)
        || (entry.input === prev.input && entry.output === prev.output && entry.provider < prev.provider)
      if (better) byModel.set(key, entry)
    }
  }
  return [...byModel.values()]
    .map(({ provider: _provider, ...price }) => price)
    .sort((a, b) => a.model.localeCompare(b.model))
}

/**
 * Price one record's tokens. Cache reads are billed separately (models.dev
 * `cache_read`); when a model does not publish cache prices, the industry
 * defaults apply — a cache read at 0.1x the input price, a cache write at 1.25x.
 * Prices are per million tokens.
 */
export function priceTokens(price: ModelPrice, counts: TokenCounts): number {
  const cacheRead = price.cacheRead ?? price.input * 0.1
  const cacheWrite = price.cacheWrite ?? price.input * 1.25
  return (
    counts.input * price.input
    + counts.output * price.output
    + counts.cacheRead * cacheRead
    + counts.cacheWrite * cacheWrite
  ) / 1_000_000
}

/** Token counts of one `usage` object, across the field names the harness has used. */
export function tokenCounts(u: any): TokenCounts {
  const input = Number(u.inputTokens ?? u.input_tokens ?? u.promptTokens ?? u.input ?? 0)
  const output = Number(u.outputTokens ?? u.output_tokens ?? u.completionTokens ?? u.output ?? 0)
  const cacheRead = Number(u.cacheReadTokens ?? u.cached_tokens ?? u.cache_read ?? 0)
  const cacheWrite = Number(u.cacheWriteTokens ?? u.cache_write ?? 0)
  const total = Number(u.totalTokens ?? u.total_tokens ?? u.total ?? 0)
  return { input, output, cacheRead, cacheWrite, total: total || input + output + cacheRead + cacheWrite }
}

async function fetchPricingWithCache(): Promise<ModelPrice[]> {
  const now = Date.now()
  if (cachedPricing.length && (now - lastPricingFetch) < PRICING_TTL) return cachedPricing
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 5000)
    const res = await fetch('https://models.dev/api.json', { signal: ctrl.signal } as any)
    clearTimeout(t)
    if (res.ok) {
      const out = buildPriceTable(await res.json())
      if (out.length) {
        cachedPricing = out
        lastPricingFetch = now
        return out
      }
    }
  } catch {}
  // Offline fallback so the tab still shows a usable table (USD per 1M tokens).
  if (!cachedPricing.length) {
    cachedPricing = [
      { model: 'deepseek-chat', input: 0.1, output: 0.425, cacheRead: 0.05 },
      { model: 'deepseek-reasoner', input: 0.4, output: 1.7, cacheRead: 0.2 },
    ]
    lastPricingFetch = now
  }
  return cachedPricing
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

/**
 * Incremental session-log parser: feed it decoded lines, ask for the per-day
 * totals. Incremental because the scan streams each log instead of buffering it.
 *
 * Every billed record is priced with ITS OWN model and bucketed by ITS OWN
 * timestamp: a session can switch models mid-flight, and the totals must respect
 * the requested range instead of summing all of history.
 * @param prices - price table keyed by `normalizeModelId`.
 * @param fallbackDay - UTC day to use for records that carry no timestamp (the log's mtime day).
 */
function createStatsAccumulator(
  prices: Map<string, ModelPrice>,
  fallbackDay: string,
): { push: (line: Buffer) => void; stats: () => SessionStats } {
  const byDay: Record<string, DayBucket> = {}
  const models = new Set<string>()
  const unpriced: Record<string, number> = {}
  const bucket = (day: string): DayBucket => {
    byDay[day] ??= emptyBucket()
    return byDay[day]
  }
  /** Bill one usage payload into its day bucket, priced by `model`. */
  const bill = (day: string, counts: TokenCounts, model: string | undefined): void => {
    const price = model === undefined ? undefined : prices.get(normalizeModelId(model))
    const b = bucket(day)
    b.cost += price === undefined ? 0 : priceTokens(price, counts)
    b.tokens += counts.total
    b.inputTokens += counts.input
    b.outputTokens += counts.output
    b.cacheReadTokens += counts.cacheRead
    b.cacheWriteTokens += counts.cacheWrite
    b.requests += 1
    models.add(model ?? '(unknown)')
    if (price === undefined && counts.total > 0) {
      const key = model ?? '(unknown)'
      unpriced[key] = (unpriced[key] ?? 0) + counts.total
    }
  }
  // A streamed step is reported twice: `assistant/chunk` records carry the
  // running usage while it streams, and the closing `assistant/message` carries
  // the same step's final usage (measured: 2007 chunk records, all 2007 matching
  // a message's turn:step). Billing both double-counts ~13% of all tokens, so a
  // step resolves to its message, and to its last chunk only when no message
  // ever landed (a turn killed mid-stream is still real spend).
  const steps = new Map<string, { day: string; chunk?: TokenCounts; message?: TokenCounts; model?: string }>()
  let lastModel: string | undefined
  return {
    push(line: Buffer) {
      if (line.length === 0) return
      // Cheap byte gate before any decoding: a session log is mostly large
      // assistant-message records (100 KB+ each) that carry no billing data, and
      // turning every one of them into a JS string dominated the cold scan.
      if (!mayCarryBilling(line)) return
      try {
        const obj: any = JSON.parse(line.toString('utf8'))
        const d = obj?.data
        const model: string | undefined = obj?.model ?? obj?.payload?.model ?? d?.model ?? d?.message?.source?.model
        if (model) lastModel = model
        const day = dayOf(obj?.time ?? d?.time) ?? fallbackDay
        const chunkUsage = d?.chunk?.usage
        const messageUsage = d?.message?.usage
        const u = obj?.usage ?? d?.usage ?? chunkUsage ?? messageUsage
        if (u) {
          const counts = tokenCounts(u)
          const turn = Number(d?.turn)
          const step = Number(d?.step)
          if (Number.isFinite(turn) && Number.isFinite(step)) {
            const key = `${turn}:${step}`
            const entry = steps.get(key) ?? { day }
            entry.day = day
            if (chunkUsage !== undefined && messageUsage === undefined) entry.chunk = counts
            else {
              entry.message = counts
              entry.model = model ?? entry.model
            }
            steps.set(key, entry)
          } else {
            bill(day, counts, model)
          }
        }
        // Legacy shapes: an explicit cost, or a bare token count with no usage object.
        if (obj?.cost) bucket(day).cost += Number(obj.cost) || 0
        if (obj?.tokens) {
          const legacy = Number(obj.tokens) || 0
          bucket(day).tokens += legacy
          if (legacy > 0) unpriced['(unknown)'] = (unpriced['(unknown)'] ?? 0) + legacy
        }
      } catch {}
    },
    stats(): SessionStats {
      for (const entry of steps.values()) {
        const counts = entry.message ?? entry.chunk
        if (!counts) continue
        // A chunk-only step has no model of its own: attribute it to the session's
        // model (chunks belong to the step that produced them).
        bill(entry.day, counts, entry.message ? entry.model : (entry.model ?? lastModel))
      }
      return { byDay, models: [...models], unpriced }
    },
  }
}

/** Sum the requested window's days into totals plus a per-day series (index 0 = today). */
function assembleWindow(
  windowDates: string[],
  sources: Iterable<SessionStats>,
): { totals: DayBucket; daily: Array<{ date: string } & DayBucket>; usedModels: Set<string>; unpriced: Map<string, number> } {
  const totals = emptyBucket()
  const perDay = new Map<string, DayBucket>(windowDates.map((d) => [d, emptyBucket()]))
  const usedModels = new Set<string>()
  const unpriced = new Map<string, number>()
  for (const stats of sources) {
    for (const [day, b] of Object.entries(stats.byDay)) {
      const target = perDay.get(day)
      if (!target) continue // outside the requested range
      target.cost += b.cost
      target.tokens += b.tokens
      target.inputTokens += b.inputTokens
      target.outputTokens += b.outputTokens
      target.cacheReadTokens += b.cacheReadTokens
      target.cacheWriteTokens += b.cacheWriteTokens
      target.requests += b.requests
      totals.cost += b.cost
      totals.tokens += b.tokens
      totals.inputTokens += b.inputTokens
      totals.outputTokens += b.outputTokens
      totals.cacheReadTokens += b.cacheReadTokens
      totals.cacheWriteTokens += b.cacheWriteTokens
      totals.requests += b.requests
    }
    for (const m of stats.models) usedModels.add(m)
    for (const [m, t] of Object.entries(stats.unpriced)) unpriced.set(m, (unpriced.get(m) ?? 0) + t)
  }
  return { totals, daily: windowDates.map((date) => ({ date, ...(perDay.get(date) as DayBucket) })), usedModels, unpriced }
}

export async function getUsageSnapshot(
  range: '7d' | '30d' = '7d',
  opts: GetUsageOpts = {},
  cordisCtx?: any,
): Promise<UsageSnapshot> {
  const generatedAt = Date.now()
  const warnings: string[] = []
  const days = range === '7d' ? 7 : 30
  const windowDates = Array.from({ length: days }, (_, i) => new Date(Date.now() - i * 86400000).toISOString().slice(0, 10))

  const pricing = opts.pricing ?? await fetchPricingWithCache()
  if (opts.pricing) {
    // also update cache for future
    cachedPricing = opts.pricing
    lastPricingFetch = generatedAt
  }
  const prices = new Map(pricing.map((p) => [normalizeModelId(p.model), p]))

  /** Pricing list for the UI: only models actually seen in the window. */
  const priceListFor = (used: Set<string>): ModelPrice[] => {
    if (used.size === 0) return pricing.slice(0, 20)
    const normalized = new Set([...used].map(normalizeModelId))
    const rows = pricing.filter((p) => normalized.has(normalizeModelId(p.model)))
    return (rows.length ? rows : pricing).slice(0, 20)
  }

  const withWarnings = (used: Set<string>, unpriced: Map<string, number>) => {
    for (const [model, tokens] of [...unpriced.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)) {
      warnings.push(`unpriced model ${model} — ${tokens} tokens have no models.dev price`)
    }
    return warnings.length ? warnings : undefined
  }

  // Framework-native: try live sessionProjections/tokenUsage first (Turn Usage built-in)
  // Falls back to file scan when registry not composed (headless) or throws.
  const tryBuiltin = async (): Promise<{ stats: SessionStats } | null> => {
    try {
      const sessionsSvc = cordisCtx?.get?.('sessions') ?? cordisCtx?.sessions
      const projSvc = cordisCtx?.get?.('sessionProjections') ?? cordisCtx?.sessionProjections
      if (!sessionsSvc || !projSvc) return null
      const list: any[] = typeof sessionsSvc.list === 'function' ? sessionsSvc.list() : []
      if (!Array.isArray(list) || list.length === 0) return null
      const byDay: Record<string, DayBucket> = {}
      const models = new Set<string>()
      const unpriced: Record<string, number> = {}
      let any = false
      for (const session of list) {
        try {
          const snap: any = projSvc.snapshot?.(session) ?? projSvc.snapshot?.(session, ['tokenUsage', 'sessionStats'])
          const values: any = snap?.values ?? {}
          const tu: any = values.tokenUsage
          const ss: any = values.sessionStats
          let model: string | undefined
          try { model = session.requestContext?.()?.model ?? session.requestHeader?.()?.config?.model } catch {}
          if (!model) { try { model = (session as any).requestContext?.model } catch {} }
          model = model ?? 'deepseek-chat'
          models.add(model)
          const counts: TokenCounts = {
            input: Number(tu?.uncachedInputTokens ?? 0),
            output: Number(tu?.outputTokens ?? 0),
            cacheRead: Number(tu?.cacheReadTokens ?? 0),
            cacheWrite: Number(tu?.cacheWriteTokens ?? 0),
            total: 0,
          }
          counts.total = counts.input + counts.output + counts.cacheRead + counts.cacheWrite
          const effectiveTokens = counts.total > 0 ? counts.total : Number(ss?.decodeTokens ?? 0)
          const price = prices.get(normalizeModelId(model))
          const cost = price === undefined ? 0 : priceTokens(price, counts)
          if (price === undefined && effectiveTokens > 0) unpriced[model] = (unpriced[model] ?? 0) + effectiveTokens
          const createdAt: number | undefined = (session.header as any)?.createdAt ?? (session as any).createdAt
          const day = dayOf(createdAt) ?? new Date().toISOString().slice(0, 10)
          const b = (byDay[day] ??= emptyBucket())
          b.cost += cost
          b.tokens += effectiveTokens
          b.inputTokens += counts.input
          b.outputTokens += counts.output || (counts.total === 0 ? effectiveTokens : 0)
          b.cacheReadTokens += counts.cacheRead
          b.cacheWriteTokens += counts.cacheWrite
          b.requests += Number(ss?.steps ?? ss?.turns ?? 1) || 1
          any = true
        } catch (e: any) { warnings.push(`builtin session skipped: ${String(e?.message ?? e)}`) }
      }
      return any ? { stats: { byDay, models: [...models], unpriced } } : null
    } catch { return null }
  }

  const builtin = await tryBuiltin()
  if (builtin) {
    const { totals, daily, usedModels, unpriced } = assembleWindow(windowDates, [builtin.stats])
    if (totals.requests > 0 && totals.tokens > 0) {
      return {
        v: 1,
        generatedAt,
        data: { totals, daily, pricing: priceListFor(usedModels), warnings: withWarnings(usedModels, unpriced) },
      }
    }
  }

  try {
    const sessionsDir = opts.sessionsDir ?? join(homedir(), '.dsh', 'sessions')
    const statsList: SessionStats[] = []
    if (existsSync(sessionsDir)) {
      const entries = collectSessionEntries(sessionsDir)
      let decoderMissing = false
      await mapLimited(entries, SCAN_CONCURRENCY, async (ent) => {
        const cacheKey = ent.name
        try {
          const st = statSync(ent.path)
          const mtime = st.mtimeMs
          const cached = cache.get(cacheKey)
          if (cached && cached.mtime === mtime) {
            statsList.push(cached.stats)
            return
          }
          const accumulator = createStatsAccumulator(prices, new Date(mtime).toISOString().slice(0, 10))
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
          statsList.push(stats)
        } catch (e: any) {
          warnings.push(`skipped ${cacheKey}: ${String(e?.message ?? e)}`)
        }
      })
    }

    const { totals, daily, usedModels, unpriced } = assembleWindow(windowDates, statsList)
    return {
      v: 1,
      generatedAt,
      data: { totals, daily, pricing: priceListFor(usedModels), warnings: withWarnings(usedModels, unpriced) },
    }
  } catch (e: any) {
    return {
      v: 1,
      generatedAt,
      data: {
        totals: emptyBucket(),
        daily: [],
        pricing: [],
        warnings: [String(e?.message ?? e)],
      }
    }
  }
}
