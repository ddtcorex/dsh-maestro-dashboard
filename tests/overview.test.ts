import { describe, test, expect, beforeEach } from 'vitest'
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
