import { describe, test, expect } from 'vitest'
import { getOverviewSnapshot } from '../src/host/overview.ts'

describe('overview handler', () => {
  test('returns null data before scan (empty ctx)', async () => {
    const snap = await getOverviewSnapshot({ get: () => undefined })
    expect(snap.v).toBe(1)
    expect(snap.data).toBeNull()
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
    expect(govard.status).toBe('warn')
    expect(govard.value).toBe('not installed')
  })
})
