import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { zstdCompressSync } from 'node:zlib'
import { getUsageSnapshot, clearCacheForTest } from '../src/host/usage.ts'

describe('usage handler', () => {
  let dir: string
  beforeEach(() => {
    clearCacheForTest()
    dir = mkdtempSync(join(tmpdir(), 'dash-usage-'))
    writeFileSync(join(dir, 'session1.jsonl'), '{"ok":1}')
  })
  test('incremental scan caches by mtime', async () => {
    const a = await getUsageSnapshot('7d', { sessionsDir: dir })
    expect(a.data!.totals.cost).toBeGreaterThan(0)
    const b = await getUsageSnapshot('7d', { sessionsDir: dir })
    expect(b.data!.totals.cost).toBe(a.data!.totals.cost)
  })
  test('corrupt session skipped with warning', async () => {
    writeFileSync(join(dir, 'bad.jsonl.zstd'), 'not-zstd')
    const s = await getUsageSnapshot('7d', { sessionsDir: dir })
    expect(s.data!.warnings?.join('')).toContain('skipped')
  })
  test('pricing only shows used models (not 5900)', async () => {
    const s = await getUsageSnapshot('7d', { sessionsDir: dir })
    expect(s.data!.pricing.length).toBeLessThan(20)
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
    // each session: tokens 1700, cost (1000+200)/1000*1 + 500/1000*2 = 1.2 + 1 = 2.2
    expect(s.data!.totals.tokens).toBe(3400)
    expect(s.data!.totals.cost).toBeCloseTo(4.4, 1)
    expect(s.data!.totals.requests).toBe(4)
    expect(s.data!.daily.length).toBe(7)
    // daily bucket for today should have cost/tokens
    const today = new Date(now).toISOString().slice(0, 10)
    const todayEntry = s.data!.daily.find(d => d.date === today)
    expect(todayEntry?.tokens).toBe(3400)
  })
})

// Regression (2026-09-23, after DSH 0.1.7-rc.1 bumped the Session format
// generation to v4): this scan selected logs by literal filename only, so every
// current session was skipped and the Usage totals silently dropped to the 21
// legacy generation-0 logs out of 418 session dirs on a real machine.
describe('usage handler — session log generations', () => {
  let dir: string
  const pricing = [{ model: 'deepseek-chat', input: 1, output: 1 }]

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
    writeFileSync(join(makeSessionDir('session-a'), 'session.v4.jsonl'), '{"cost":3}\n')
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.cost).toBe(3)
    expect(s.data!.totals.requests).toBe(1)
  })

  test('counts a current-generation compressed session dir', async () => {
    const d = makeSessionDir('session-b')
    writeFileSync(join(d, 'session.v4.jsonl.zstd'), zstdCompressSync(Buffer.from('{"cost":5}\n')))
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.cost).toBe(5)
    expect(s.data!.totals.requests).toBe(1)
  })

  test('counts a session once, from its newest generation', async () => {
    const d = makeSessionDir('session-c')
    writeFileSync(join(d, 'session.v3.jsonl'), '{"cost":11}\n') // stale artifact
    writeFileSync(join(d, 'session.v4.jsonl'), '{"cost":7}\n') // live log
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.cost).toBe(7)
    expect(s.data!.totals.requests).toBe(1)
  })

  test('still counts the legacy flat layout', async () => {
    writeFileSync(join(dir, 'session-legacy.jsonl'), '{"cost":2}\n')
    const s = await getUsageSnapshot('7d', { sessionsDir: dir, pricing })
    expect(s.data!.totals.cost).toBe(2)
    expect(s.data!.totals.requests).toBe(1)
  })
})
