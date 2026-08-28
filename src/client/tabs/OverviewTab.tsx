import * as React from 'react'
import { HeroKpi } from '../components/HeroKpi.tsx'
import { Heatmap } from '../components/Heatmap.tsx'
function formatTime(ts: number) {
  if (!ts) return '-'
  const d = new Date(ts)
  return d.toLocaleString()
}
function formatDuration(ms?: number) {
  if (!ms || ms <= 0) return '-'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${rem}s`
}
export function OverviewTab(props: { snapshot?: any; reviewsSnapshot?: any }) {
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
        <div style={{ font: 'var(--dsw-font-xs-strong-13)', marginBottom: 12, color: 'var(--dsw-alias-label-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Recent sessions — {props.snapshot?.data?.sessions?.length ?? 0}</span>
          <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>sorted by last active</span>
        </div>
        {!props.snapshot?.data?.sessions?.length ? (
          <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)' }}>No sessions yet — start a new DSH session</div>
        ) : (
          <div style={{ display: 'grid', gap: 8, maxHeight: 320, overflowY: 'auto' as any }}>
            {props.snapshot.data.sessions.map((s: any) => (
              <div key={s.id} style={{ border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 8, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: 'var(--dsw-alias-bg-base)' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.title || s.id.slice(0, 24)}</div>
                  <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>{s.id.slice(0, 16)} · {formatTime(s.lastActive)} </div>
                </div>
                <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)', flexShrink: 0 }}>${(s.cost ?? 0).toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, background: 'var(--dsw-alias-bg-layer-1)', padding: 16, overflowX: 'auto' }}>
        <div style={{ font: 'var(--dsw-font-xs-strong-13)', marginBottom: 12, color: 'var(--dsw-alias-label-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Recent reviews — {props.reviewsSnapshot?.data?.reviews?.length ?? 0}</span>
          <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>from dsh-maestro-review</span>
        </div>
        {!props.reviewsSnapshot?.data?.reviews?.length ? (
          <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)' }}>No reviews yet</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {props.reviewsSnapshot.data.reviews.map((r: any) => (
              <div key={r.id} style={{ border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 8, padding: 12, display: 'grid', gap: 6, background: 'var(--dsw-alias-bg-base)' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)' }}>{r.projectPath} !{r.mrIid}</span>
                  <span style={{ font: 'var(--dsw-font-xxs-12)', padding: '2px 6px', borderRadius: 10, background: r.status === 'completed' ? 'var(--dsw-alias-state-success-subtle)' : r.status === 'running' ? 'var(--dsw-alias-state-warn-subtle)' : 'var(--dsw-alias-bg-layer-2)', color: r.status === 'completed' ? 'var(--dsw-alias-state-success-primary)' : r.status === 'running' ? 'var(--dsw-alias-state-warn-primary)' : 'var(--dsw-alias-label-secondary)', border: '1px solid var(--dsw-alias-border-l1)' }}>{r.status}</span>
                  <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>{r.mode} · {r.scope} · {r.trigger}</span>
                  <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginLeft: 'auto' }}>{formatTime(r.startedAt)} · {formatDuration(r.durationMs)} · {r.headSha.slice(0, 7)}</span>
                </div>
                {r.summary && <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 84, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.summary.slice(0, 600)}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
