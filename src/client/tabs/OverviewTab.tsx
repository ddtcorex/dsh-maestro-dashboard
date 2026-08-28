import * as React from 'react'
import { HeroKpi } from '../components/HeroKpi.tsx'
import { Heatmap } from '../components/Heatmap.tsx'
export function OverviewTab(props: { snapshot?: any }) {
  const kpis = props.snapshot?.data?.kpis ?? [
    { id: 'tunnel', label: 'Tunnel', value: 'ok', status: 'ok' },
    { id: 'review', label: 'Review', value: '0 queued', status: 'ok' },
    { id: 'govard', label: 'Govard', value: 'ok', status: 'ok' },
    { id: 'notifier', label: 'Notifier', value: 'ok', status: 'ok' },
  ]
  // 52-week heatmap: 364 days (52*7) with real dates, matching the 53-column grid (year view)
  const heatmap = props.snapshot?.data?.heatmap ?? Array.from({ length: 52 * 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (364 - 1 - i))
    return { date: d.toISOString().slice(0, 10), count: Math.floor(Math.random() * 5) }
  })
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <HeroKpi kpis={kpis} />
      <div data-heatmap-wrap style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, background: 'var(--dsw-alias-bg-layer-1)', padding: 16, overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
        <div style={{ font: 'var(--dsw-font-xs-strong-13)', marginBottom: 12, color: 'var(--dsw-alias-label-primary)' }}>Activity Heatmap (52 weeks)</div>
        <Heatmap data={heatmap} />
      </div>
      <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, background: 'var(--dsw-alias-bg-layer-1)', padding: 16 }}>
        <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)' }}>Recent sessions — {props.snapshot?.data?.sessions?.length ?? 0} items</div>
      </div>
    </div>
  )
}
