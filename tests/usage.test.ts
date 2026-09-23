import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { zstdCompressSync } from 'node:zlib'
import {
  getUsageSnapshot,
  clearCacheForTest,
  buildPriceTable,
  normalizeModelId,
  priceTokens,
} from '../src/host/usage.ts'

const DAY = 86_400_000
const day = (offsetDays: number) => new Date(Date.now() - offsetDays * DAY).toISOString().slice(0, 10)

/** A real-shaped billed record: model under message.source, usage under data.message. */
function record(opts: {
  offsetDays?: number
  model?: string
  usage?: Record<string, number>
  time?: number
} = {}): string {
  return JSON.stringify({
    type: 'assistant/message',
    time: opts.time ?? Date.now() - (opts.offsetDays ?? 0) * DAY,
    data: {
      message: {
        source: { provider: 'deepseek-official', model: opts.model ?? 'deepseek-chat' },
        usage: opts.usage ?? { inputTokens: 1000, outputTokens: 500, totalTokens: 1500 },
      },
    },
  })
}

describe('usage handler', () => {
  let dir: string
  const pricing = [{ model: 'deepseek-chat', input: 1, output: 2 }]

  beforeEach(() => {
    clearCacheForTest()
    dir = mkdtempSync(join(tmpdir(), 'dash-usage-'))
  })
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  /** One session log in the current layout; one zstd frame per line when compressed. */
  const writeLog = (id: string, lines: string[], compressed = false): string => {
    const d = join(dir, '--proj--', id)
    mkdirSync(d, { recursive: true })
    const p = join(d, compressed ? 'session.v4.jsonl.zstd' : 'session.v4.jsonl')
    writeFileSync(p, compressed
      ? Buffer.concat(lines.map((l) => zstdCompressSync(Buffer.from(l + '\n'))))
      : lines.join('\n') + '\n')
    return p
  }

  test('incremental scan caches by mtime', async () => {
    writeLog('session-1', [record()])
    const a = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(a.data!.totals.tokens).toBe(1500)
    const b = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(b.data!.totals.tokens).toBe(a.data!.totals.tokens)
  })

  test('corrupt session skipped with warning', async () => {
    const d = join(dir, '--proj--', 'session-bad')
    mkdirSync(d, { recursive: true })
    writeFileSync(join(d, 'session.v4.jsonl.zstd'), Buffer.from('not-zstd'))
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.warnings?.join('')).toContain('skipped')
  })

  test('pricing only shows used models (not 5900)', async () => {
    writeLog('session-used', [record({ model: 'deepseek-chat' })])
    const s = await getUsageSnapshot('7d', {
      sessionsDir: dir,
      pricing: [
        { model: 'deepseek-chat', input: 1, output: 2 },
        { model: 'gpt-5-never-used', input: 9, output: 9 },
      ],
    })
    expect(s.data!.pricing.map((p) => p.model)).toEqual(['deepseek-chat'])
  })

  test('uses built-in tokenUsage when sessionProjections available', async () => {
    const now = Date.now()
    const mkSession = (id: string, model: string, createdAt: number) => ({
      header: { createdAt, id },
      requestContext: () => ({ model }),
      requestHeader: () => ({ config: { model } }),
    })
    const s1 = mkSession('session-1', 'deepseek-chat', now)
    const s2 = mkSession('session-2', 'deepseek-chat', now)
    const ctx: any = {
      get: (name: string) => {
        if (name === 'sessions') return { list: () => [s1, s2] }
        if (name === 'sessionProjections') return {
          snapshot: () => ({
            values: {
              tokenUsage: { uncachedInputTokens: 1000, outputTokens: 500, cacheReadTokens: 200, cacheWriteTokens: 0 },
              sessionStats: { steps: 2, turns: 1, decodeTokens: 500 },
            },
          }),
        }
        return undefined
      },
    }
    const s = await getUsageSnapshot('7d', { pricing: [{ model: 'deepseek-chat', input: 1, output: 2 }] }, ctx)
    // each session: 1700 tokens, cost = (1000*1 + 500*2 + 200*0.1) / 1e6 = 0.00202
    expect(s.data!.totals.tokens).toBe(3400)
    expect(s.data!.totals.cost).toBeCloseTo(0.00404, 6)
    expect(s.data!.totals.requests).toBe(4)
    expect(s.data!.daily.length).toBe(7)
    const today = new Date(now).toISOString().slice(0, 10)
    expect(s.data!.daily.find((d) => d.date === today)?.tokens).toBe(3400)
  })
})

// Regression (2026-09-23): cost was never derived from tokens — the parser read
// only an explicit `cost` field (which the harness does not write) and the
// pricing table came out EMPTY because its costs were read one level above where
// models.dev stores them. The Usage tab therefore reported 41,800 stub tokens and
// ~$0.22 while the real tree held 6.1e9 tokens.
describe('usage handler — cost from billed records', () => {
  let dir: string
  const pricing = [{ model: 'deepseek-chat', input: 1, output: 2, cacheRead: 0.1, cacheWrite: 1.25 }]

  beforeEach(() => {
    clearCacheForTest()
    dir = mkdtempSync(join(tmpdir(), 'dash-usage-cost-'))
  })
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  const writeLog = (id: string, lines: string[]): string => {
    const d = join(dir, '--proj--', id)
    mkdirSync(d, { recursive: true })
    const p = join(d, 'session.v4.jsonl')
    writeFileSync(p, lines.join('\n') + '\n')
    return p
  }

  test('prices each record with its own model', async () => {
    writeLog('session-mixed-model', [
      record({ model: 'deepseek-chat', usage: { inputTokens: 1_000_000, outputTokens: 0, totalTokens: 1_000_000 } }),
      record({ model: 'deepseek-reasoner', usage: { inputTokens: 1_000_000, outputTokens: 0, totalTokens: 1_000_000 } }),
    ])
    const s = await getUsageSnapshot('7d', {
      sessionsDir: dir,
      pricing: [
        { model: 'deepseek-chat', input: 1, output: 2 },
        { model: 'deepseek-reasoner', input: 4, output: 8 },
      ],
    })
    expect(s.data!.totals.cost).toBeCloseTo(1 + 4, 9)
    expect(s.data!.totals.tokens).toBe(2_000_000)
  })

  test('bills cache reads and cache writes at their own price', async () => {
    writeLog('session-cache', [
      record({ usage: { inputTokens: 1_000_000, outputTokens: 1_000_000, cacheReadTokens: 1_000_000, cacheWriteTokens: 1_000_000, totalTokens: 4_000_000 } }),
    ])
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.cost).toBeCloseTo(1 + 2 + 0.1 + 1.25, 9)
    expect(s.data!.totals.cacheReadTokens).toBe(1_000_000)
    expect(s.data!.totals.cacheWriteTokens).toBe(1_000_000)
  })

  test('falls back to 0.1x read / 1.25x write when the model publishes no cache prices', async () => {
    writeLog('session-nocacheprice', [
      record({ usage: { inputTokens: 0, outputTokens: 0, cacheReadTokens: 1_000_000, cacheWriteTokens: 1_000_000, totalTokens: 2_000_000 } }),
    ])
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing: [{ model: 'deepseek-chat', input: 10, output: 20 }] })
    expect(s.data!.totals.cost).toBeCloseTo(0.1 * 10 + 1.25 * 10, 9)
  })

  test('warns about an unpriced model instead of billing it at zero', async () => {
    writeLog('session-unpriced', [
      record({ model: 'brand-new-model', usage: { inputTokens: 5_000_000, outputTokens: 0, totalTokens: 5_000_000 } }),
    ])
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.cost).toBe(0)
    expect(s.data!.totals.tokens).toBe(5_000_000)
    expect(s.data!.warnings?.join('|')).toContain('unpriced model brand-new-model')
  })

  test('counts one request per billed record', async () => {
    writeLog('session-requests', [record(), record(), record()])
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.requests).toBe(3)
  })

  test('does not double count a streamed step', async () => {
    // A step is reported twice: `assistant/chunk` carries the running usage while
    // it streams, `assistant/message` the same step's final usage (measured: 2007
    // chunk records, every one matching a message's turn:step).
    writeLog('session-streamed', [
      JSON.stringify({ type: 'assistant/chunk', time: Date.now(), data: { turn: 1, step: 1, chunk: { type: 'usage', usage: { inputTokens: 1000, outputTokens: 100, totalTokens: 1100 } } } }),
      JSON.stringify({ type: 'assistant/message', time: Date.now(), data: { turn: 1, step: 1, message: { source: { model: 'deepseek-chat' }, usage: { inputTokens: 1000, outputTokens: 100, totalTokens: 1100 } } } }),
    ])
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.tokens).toBe(1100)
    expect(s.data!.totals.requests).toBe(1)
  })

  test('counts a step that only streamed, priced with the session model', async () => {
    writeLog('session-orphan-chunk', [
      record({ model: 'deepseek-chat' }), // 1500 tokens, and establishes the session model
      JSON.stringify({ type: 'assistant/chunk', time: Date.now(), data: { turn: 4, step: 2, chunk: { type: 'usage', usage: { inputTokens: 1_000_000, outputTokens: 0, totalTokens: 1_000_000 } } } }),
    ])
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.tokens).toBe(1_001_500)
    expect(s.data!.totals.cost).toBeCloseTo((1000 * 1 + 500 * 2) / 1_000_000 + 1, 9)
  })

  test('buckets cost by day and applies the range window', async () => {
    writeLog('session-days', [record({ offsetDays: 0 }), record({ offsetDays: 10 })])
    const week = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(week.data!.totals.requests).toBe(1) // the 10-day-old record is outside 7d
    const month = await getUsageSnapshot('30d', { sessionsDir: dir, pricing })
    expect(month.data!.totals.requests).toBe(2)
    expect(month.data!.daily.find((d) => d.date === day(0))?.requests).toBe(1)
    expect(month.data!.daily.find((d) => d.date === day(10))?.requests).toBe(1)
    expect(month.data!.daily.length).toBe(30)
  })
})

describe('pricing table', () => {
  const payload = {
    'deepseek-ai': {
      models: {
        'DeepSeek-V4.1-Flash': { cost: { input: 0.28, output: 0.42, cache_read: 0.028 } },
        'placeholder-free': { cost: { input: 0, output: 0 } },
      },
    },
    'alibaba-token-plan': {
      models: {
        'deepseek-v4.1-flash': { cost: { input: 0, output: 0, cache_read: 0, cache_write: 0 } },
      },
    },
    expensive: {
      models: { 'deepseek-v4.1-flash': { cost: { input: 3, output: 9 } } },
    },
  }

  test('normalises provider prefixes and punctuation for lookup', () => {
    expect(normalizeModelId('deepseek-ai/DeepSeek-V4.1-Flash')).toBe('deepseekv41flash')
    expect(normalizeModelId('deepseek-v4.1-flash')).toBe('deepseekv41flash')
  })

  test('reads costs from the provider model list, drops zero rows and keeps the cheapest', () => {
    const table = buildPriceTable(payload)
    const flash = table.find((p) => normalizeModelId(p.model) === 'deepseekv41flash')
    expect(flash).toBeDefined()
    expect(flash!.input).toBe(0.28) // the free alias and the 3.0 provider both lose
    expect(flash!.cacheRead).toBe(0.028)
    expect(table.some((p) => p.model === 'placeholder-free')).toBe(false)
  })

  test('prices per million tokens', () => {
    expect(priceTokens({ model: 'm', input: 1, output: 2 }, { input: 1_000_000, output: 1_000_000, cacheRead: 0, cacheWrite: 0, total: 0 })).toBe(3)
  })
})

describe('usage handler — session log generations', () => {
  let dir: string
  const pricing = [{ model: 'deepseek-chat', input: 1, output: 2 }]

  beforeEach(() => {
    clearCacheForTest()
    dir = mkdtempSync(join(tmpdir(), 'dash-usage-gen-'))
  })
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  const makeSessionDir = (id: string): string => {
    const d = join(dir, '--proj--', id)
    mkdirSync(d, { recursive: true })
    return d
  }

  test('counts a current-generation plaintext session dir', async () => {
    writeFileSync(join(makeSessionDir('session-a'), 'session.v4.jsonl'), record() + '\n')
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.tokens).toBe(1500)
    expect(s.data!.totals.requests).toBe(1)
  })

  test('counts a current-generation compressed session dir', async () => {
    const d = makeSessionDir('session-b')
    writeFileSync(join(d, 'session.v4.jsonl.zstd'), zstdCompressSync(Buffer.from(record() + '\n')))
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.tokens).toBe(1500)
    expect(s.data!.totals.requests).toBe(1)
  })

  test('counts a session once, from its newest generation', async () => {
    const d = makeSessionDir('session-c')
    writeFileSync(join(d, 'session.v3.jsonl'), JSON.stringify({ tokens: 11 }) + '\n') // stale artifact
    writeFileSync(join(d, 'session.v4.jsonl'), record() + '\n') // live log
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.tokens).toBe(1500)
    expect(s.data!.totals.requests).toBe(1)
  })

  test('still counts the legacy flat layout', async () => {
    writeFileSync(join(dir, 'session-legacy.jsonl'), record() + '\n')
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.tokens).toBe(1500)
    expect(s.data!.totals.requests).toBe(1)
  })
})

// Regression (2026-09-23): the harness writes a session log as ONE ZSTD FRAME
// PER EVENT. Node's zstd decoder — both `zstdDecompressSync` and the streaming
// API, measured — stops after the FIRST frame and returns just the header line
// without throwing, so every session parsed as an empty log and the Usage
// totals collapsed to the parser's stub.
describe('usage handler — multi-frame zstd decode', () => {
  let dir: string
  const pricing = [{ model: 'deepseek-chat', input: 1, output: 2 }]

  beforeEach(() => {
    clearCacheForTest()
    dir = mkdtempSync(join(tmpdir(), 'dash-usage-frames-'))
  })
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  /** One frame per event, exactly like the harness writes it. */
  const writeMultiFrame = (id: string, events: string[]): string => {
    const d = join(dir, '--proj--', id)
    mkdirSync(d, { recursive: true })
    const p = join(d, 'session.v4.jsonl.zstd')
    writeFileSync(p, Buffer.concat(events.map((e) => zstdCompressSync(Buffer.from(e + '\n')))))
    return p
  }

  test('reads usage from frames after the first one', async () => {
    writeMultiFrame('session-frames', [
      JSON.stringify({ type: 'session', version: 4, id: 'session-frames', createdAt: Date.now() }),
      record({ usage: { inputTokens: 1000, outputTokens: 500, totalTokens: 1500 } }),
    ])
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.tokens).toBe(1500)
  })

  test('reports a missing zstd binary once, not once per file', async () => {
    // The decoder is a `zstd` spawn, so a machine without the binary must say so
    // plainly instead of labelling every session "corrupt".
    for (const id of ['session-nocli-a', 'session-nocli-b']) {
      writeMultiFrame(id, [
        JSON.stringify({ type: 'session', version: 4, id, createdAt: Date.now() }),
        record(),
      ])
    }
    const savedPath = process.env.PATH
    process.env.PATH = '/nonexistent-bin'
    try {
      const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
      const warns = s.data!.warnings ?? []
      expect(warns.filter((w) => w.includes('zstd binary not found')).length).toBe(1)
      expect(s.data!.totals.tokens).toBe(0)
    } finally {
      process.env.PATH = savedPath
    }
  })

  test('counts a corrupt artifact once, with a warning, instead of stubbing it', async () => {
    const d = join(dir, '--proj--', 'session-bad')
    mkdirSync(d, { recursive: true })
    writeFileSync(join(d, 'session.v4.jsonl.zstd'), Buffer.concat([zstdCompressSync(Buffer.from(record() + '\n')), Buffer.from('notzstdframe')]))
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.warnings?.join('')).toContain('skipped')
    expect(s.data!.totals.tokens).toBe(0) // a torn log is discarded whole, never half-counted
  })

  test('reads every log in a large tree', async () => {
    for (let i = 0; i < 24; i++) {
      writeMultiFrame(`session-many-${i}`, [
        JSON.stringify({ type: 'session', version: 4, id: `session-many-${i}`, createdAt: Date.now() }),
        record(),
      ])
    }
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.tokens).toBe(24 * 1500)
    expect(s.data!.totals.requests).toBe(24)
  })
})
