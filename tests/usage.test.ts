import { describe, test, expect, beforeEach } from 'vitest'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
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
