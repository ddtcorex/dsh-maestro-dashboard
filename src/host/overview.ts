import type { OverviewSnapshot } from '../shared/types.ts'

export async function getOverviewSnapshot(ctx: any): Promise<OverviewSnapshot> {
  const generatedAt = Date.now()
  let hasNotifier = false
  let hasGovard = false
  let hasConfig = false
  try { const n = ctx?.get?.('maestroNotifier'); if (n && typeof n.ids === 'function') hasNotifier = true } catch {}
  try { const g = ctx?.get?.('govardTool') ?? ctx?.get?.('maestroGovard'); if (g) hasGovard = true } catch {}
  try { const c = ctx?.get?.('maestroConfig'); if (c) hasConfig = true } catch {}

  const anyData = hasNotifier || hasGovard || hasConfig
  if (!anyData) {
    return { v: 1, generatedAt, data: null }
  }

  const kpis: Array<{ id: string; label: string; value: string; status: 'ok' | 'warn' | 'error' }> = [
    { id: 'tunnel', label: 'Tunnel', value: hasNotifier ? 'ok' : 'n/a', status: hasNotifier ? 'ok' : 'warn' },
    { id: 'review', label: 'Review', value: '0 queued', status: 'ok' },
    { id: 'govard', label: 'Govard', value: hasGovard ? 'ok' : 'not installed', status: hasGovard ? 'ok' : 'warn' },
    { id: 'notifier', label: 'Notifier', value: hasNotifier ? 'ok' : 'not installed', status: hasNotifier ? 'ok' : 'warn' },
  ]
  const health: Array<{ id: string; status: 'ok' | 'warn' | 'error'; detail?: string }> = [
    { id: 'notifier', status: hasNotifier ? 'ok' : 'warn', detail: hasNotifier ? undefined : 'maestroNotifier not installed' },
    { id: 'govard', status: hasGovard ? 'ok' : 'warn', detail: hasGovard ? undefined : 'govard not installed' },
    { id: 'config', status: hasConfig ? 'ok' : 'warn' },
  ]
  return {
    v: 1,
    generatedAt,
    data: {
      kpis,
      health,
      heatmap: [],
      sessions: [],
    }
  }
}
