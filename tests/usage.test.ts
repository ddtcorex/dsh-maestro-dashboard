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
})
