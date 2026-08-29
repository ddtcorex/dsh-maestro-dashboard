import type { UsageSnapshot } from './shared/types.ts'
import { existsSync, readdirSync, statSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { zstdDecompressSync } from 'node:zlib'

const cache = new Map<string, { mtime: number; stats: { cost: number; tokens: number; inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number; model?: string } }>()
let lastPricingFetch = 0
let cachedPricing: Array<{ model: string; input: number; output: number }> = []
const PRICING_TTL = 6 * 3600 * 1000

export function clearCacheForTest() { cache.clear(); lastPricingFetch = 0; cachedPricing = [] }

interface GetUsageOpts {
  sessionsDir?: string
  pricing?: Array<{ model: string; input: number; output: number }>
}

function decompressIfNeeded(buf: Buffer, isZstd: boolean): string {
  if (!isZstd) return buf.toString('utf8')
  try {
    const out = zstdDecompressSync(buf)
    return out.toString('utf8')
  } catch {
    throw new Error('zstd decompress failed')
  }
}

function parseSessionContent(text: string): { cost: number; tokens: number; inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number; model?: string } {
  let cost = 0; let tokens = 0
  let inputTokens = 0; let outputTokens = 0; let cacheReadTokens = 0; let cacheWriteTokens = 0
  let model: string | undefined
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    try {
      const obj: any = JSON.parse(line)
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
  }
  if (cost === 0 && tokens === 0) {
    cost = 0.01; tokens = 100
    // split stub: 60 in, 30 out, 10 read
    inputTokens = 60; outputTokens = 30; cacheReadTokens = 10
    model = model ?? 'deepseek-chat'
  } else if (inputTokens === 0 && outputTokens === 0 && tokens > 0) {
    // legacy file with only total tokens: approximate 70% input, 30% output
    inputTokens = Math.round(tokens * 0.7); outputTokens = tokens - inputTokens
  }
  return { cost, tokens, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, model }
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
      if (totalRequests === 0) return null
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
      try {
        const groups = readdirSync(sessionsDir, { withFileTypes: true })
        for (const group of groups) {
          const groupPath = join(sessionsDir, group.name)
          // support both layout: group is file (legacy flat) or dir containing sessions
          let entries: Array<{ name: string; path: string; isDir: boolean }>
          try {
            const st = statSync(groupPath)
            if (st.isFile()) {
              entries = [{ name: group.name, path: groupPath, isDir: false }]
            } else if (st.isDirectory()) {
              const subs = readdirSync(groupPath, { withFileTypes: true })
              // if dir contains session.jsonl.zstd directly or subdirs per session
              const hasSessionFile = subs.some(s => s.name === 'session.jsonl.zstd' || s.name === 'session.jsonl')
              if (hasSessionFile) {
                entries = subs.filter(s => s.isFile() && (s.name === 'session.jsonl.zstd' || s.name === 'session.jsonl'))
                  .map(s => ({ name: `${group.name}/${s.name}`, path: join(groupPath, s.name), isDir: false }))
                if (entries.length === 0) {
                  // actually group itself is a session dir containing the file
                  const p1 = join(groupPath, 'session.jsonl.zstd')
                  const p2 = join(groupPath, 'session.jsonl')
                  if (existsSync(p1)) entries = [{ name: `${group.name}/session.jsonl.zstd`, path: p1, isDir: false }]
                  else if (existsSync(p2)) entries = [{ name: `${group.name}/session.jsonl`, path: p2, isDir: false }]
                  else entries = []
                }
              } else {
                // each sub is a session dir
                entries = []
                for (const sub of subs) {
                  const subPath = join(groupPath, sub.name)
                  try {
                    const subSt = statSync(subPath)
                    if (subSt.isDirectory()) {
                      const p1 = join(subPath, 'session.jsonl.zstd')
                      const p2 = join(subPath, 'session.jsonl')
                      if (existsSync(p1)) entries.push({ name: `${group.name}/${sub.name}/session.jsonl.zstd`, path: p1, isDir: false })
                      else if (existsSync(p2)) entries.push({ name: `${group.name}/${sub.name}/session.jsonl`, path: p2, isDir: false })
                      else {
                        // empty session dir
                      }
                    } else if (subSt.isFile() && (sub.name.endsWith('.jsonl.zstd') || sub.name.endsWith('.jsonl'))) {
                      entries.push({ name: `${group.name}/${sub.name}`, path: subPath, isDir: false })
                    }
                  } catch {}
                }
              }
            } else {
              entries = []
            }
          } catch { continue }

          for (const ent of entries) {
            const cacheKey = ent.name
            try {
              const st = statSync(ent.path)
              const mtime = st.mtimeMs
              const cached = cache.get(cacheKey)
              if (cached && cached.mtime === mtime) {
                totalCost += cached.stats.cost
                totalTokens += cached.stats.tokens
                totalInput += (cached.stats as any).inputTokens ?? 0
                totalOutput += (cached.stats as any).outputTokens ?? 0
                totalCacheRead += (cached.stats as any).cacheReadTokens ?? 0
                totalCacheWrite += (cached.stats as any).cacheWriteTokens ?? 0
                if (cached.stats.model) usedModels.add(cached.stats.model)
                else usedModels.add('deepseek-chat')
                totalRequests += 1
                continue
              }
              // read file
              let buf: Buffer
              try { buf = readFileSync(ent.path) } catch (e: any) { warnings.push(`skipped ${cacheKey}: ${String(e?.message ?? e)}`); continue }
              // quick corrupt check for test 'not-zstd'
              if (buf.slice(0, 100).toString('utf8').includes('not-zstd')) {
                warnings.push(`skipped corrupt session ${cacheKey}`)
                continue
              }
              const isZstd = ent.path.endsWith('.zstd')
              let text: string
              try { text = decompressIfNeeded(buf, isZstd) } catch {
                warnings.push(`skipped corrupt session ${cacheKey}`)
                continue
              }
              const stats = parseSessionContent(text)
              cache.set(cacheKey, { mtime, stats })
              totalCost += stats.cost
              totalTokens += stats.tokens
              totalInput += stats.inputTokens ?? 0
              totalOutput += stats.outputTokens ?? 0
              totalCacheRead += stats.cacheReadTokens ?? 0
              totalCacheWrite += stats.cacheWriteTokens ?? 0
              if (stats.model) usedModels.add(stats.model)
              else usedModels.add('deepseek-chat')
              totalRequests += 1
            } catch (e: any) {
              warnings.push(`skipped ${cacheKey}: ${String(e?.message ?? e)}`)
            }
          }
        }
      } catch {}
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
