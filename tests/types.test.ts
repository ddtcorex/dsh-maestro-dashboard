import { describe, test, expect } from 'vitest'
import { overviewSnapshotSchema, pluginSnapshotSchema, usageSnapshotSchema, dashboardMethodSchema } from '../src/shared/types.ts'

describe('shared types', () => {
  test('overview snapshot validates', () => {
    const ok = overviewSnapshotSchema.safeParse({ v: 1, generatedAt: Date.now(), data: { kpis: [], health: [], heatmap: [], sessions: [] } })
    expect(ok.success).toBe(true)
    const bad = overviewSnapshotSchema.safeParse({ v: 1 } as any)
    expect(bad.success).toBe(false)
  })
  test('plugin snapshot validates', () => {
    const ok = pluginSnapshotSchema.safeParse({ v: 1, generatedAt: Date.now(), data: { installed: [], marketplace: [], health: [] } })
    expect(ok.success).toBe(true)
  })
  test('usage snapshot validates with nullable data', () => {
    const ok = usageSnapshotSchema.safeParse({ v: 1, generatedAt: Date.now(), data: null })
    expect(ok.success).toBe(true)
  })
  test('dashboard method validates', () => {
    expect(dashboardMethodSchema.safeParse({ op: 'getOverview' }).success).toBe(true)
    expect(dashboardMethodSchema.safeParse({ op: 'getUsage', range: '7d' }).success).toBe(true)
    expect(dashboardMethodSchema.safeParse({ op: 'unknown' } as any).success).toBe(false)
  })
  test('channel is loopback-valid', async () => {
    const { DASHBOARD_CHANNEL } = await import('../src/shared/channels.ts')
    expect(/^\/[A-Za-z0-9._~-]+$/.test(DASHBOARD_CHANNEL)).toBe(true)
    expect(DASHBOARD_CHANNEL).toBe('/maestro-dashboard')
  })
})
