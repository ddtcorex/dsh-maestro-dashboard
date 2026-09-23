import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getOverviewSnapshot, clearOverviewCacheForTest } from '../src/host/overview.ts'

describe('overview handler', () => {
  beforeEach(() => clearOverviewCacheForTest())
  test('returns 4 KPIs even with empty ctx (graceful)', async () => {
    const snap = await getOverviewSnapshot({ get: () => undefined })
    expect(snap.v).toBe(1)
    expect(snap.data).not.toBeNull()
    expect(snap.data!.kpis.length).toBe(4)
    expect(snap.data!.heatmap.length).toBe(52 * 7)
  })
  test('returns 4 KPIs after with notifier', async () => {
    const snap = await getOverviewSnapshot({ get: (n: string) => n === 'maestroNotifier' ? { ids: () => ['telegram'] } : undefined })
    expect(snap.data).not.toBeNull()
    expect(snap.data!.kpis.length).toBe(4)
    expect(snap.data!.health.length).toBeGreaterThan(0)
  })
  test('govard absent degrades gracefully', async () => {
    const snap = await getOverviewSnapshot({ get: (n: string) => n === 'maestroNotifier' ? { ids: () => ['x'] } : undefined })
    const govard = snap.data!.kpis.find(k => k.id === 'govard')!
    expect(['ok', 'warn']).toContain(govard.status)
    expect(govard.value).toMatch(/not installed|installed|v\d+\.\d+\.\d+/)
  })
})

// Regression (2026-09-23, after DSH 0.1.7-rc.1 bumped the Session format
// generation to v4): the scan preferred the literal generation-0 filename and
// otherwise took an arbitrary directory entry, so a session dir holding a newer
// generation could be dated from a stale artifact.
describe('overview handler — session log generations', () => {
  let dir: string
  const day = 86400000
  const dateOf = (ms: number) => new Date(ms).toISOString().slice(0, 10)

  beforeEach(() => {
    clearOverviewCacheForTest()
    dir = mkdtempSync(join(tmpdir(), 'dash-overview-gen-'))
  })
  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  const sessionDir = (id: string): string => {
    const d = join(dir, '--proj--', id)
    mkdirSync(d, { recursive: true })
    return d
  }

  test('counts a current-generation session dir', async () => {
    const now = Date.now()
    writeFileSync(join(sessionDir('session-v4'), 'session.v4.jsonl'), JSON.stringify({ createdAt: now }) + '\n')
    const snap = await getOverviewSnapshot({ get: () => undefined }, { sessionsDir: dir })
    const today = snap.data!.heatmap.find(h => h.date === dateOf(now))
    expect(today?.count).toBe(1)
  })

  test('dates a session dir from its newest generation, not the stale one', async () => {
    const now = Date.now()
    const d = sessionDir('session-mixed')
    writeFileSync(join(d, 'session.jsonl'), JSON.stringify({ createdAt: now - 30 * day }) + '\n') // stale generation 0
    writeFileSync(join(d, 'session.v4.jsonl'), JSON.stringify({ createdAt: now }) + '\n') // live
    const snap = await getOverviewSnapshot({ get: () => undefined }, { sessionsDir: dir })
    expect(snap.data!.heatmap.find(h => h.date === dateOf(now))?.count).toBe(1)
    expect(snap.data!.heatmap.find(h => h.date === dateOf(now - 30 * day))?.count).toBe(0)
  })
})
