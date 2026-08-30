import * as React from 'react'
import { HeroKpi } from '../components/HeroKpi.tsx'
import { Heatmap } from '../components/Heatmap.tsx'
import { Sparkline } from '../components/Sparkline.tsx'

function formatTime(ts: number) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString()
}
function formatDuration(ms?: number) {
  if (!ms || ms <= 0) return '-'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${rem}s`
}

export function OverviewTab(props: {
  snapshot?: any
  reviewsSnapshot?: any
  usage?: any
  usageRange?: '7d' | '30d' | undefined
  onUsageRangeChange?: ((r: '7d' | '30d') => void) | undefined
}) {
  const kpis = props.snapshot?.data?.kpis ?? [
    { id: 'tunnel', label: 'Tunnel', value: 'ok', status: 'ok' as const },
    { id: 'review', label: 'Review', value: '0 queued', status: 'ok' as const },
    { id: 'govard', label: 'Govard', value: 'ok', status: 'ok' as const },
    { id: 'notifier', label: 'Notifier', value: 'ok', status: 'ok' as const },
  ]
  const heatmap = props.snapshot?.data?.heatmap ?? Array.from({ length: 53 * 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (53 * 7 - 1 - i))
    return { date: d.toISOString().slice(0, 10), count: Math.floor(Math.random() * 3) }
  })
  const usageData = props.usage?.data
  const totals = usageData?.totals ?? { cost: 0, tokens: 0, requests: 0 }
  const daily: Array<any> = usageData?.daily ?? []
  const tunnel = (props.snapshot?.data as any)?.tunnel as { mode?: string; id?: string; hostname?: string; hasCredentials?: boolean } | undefined
  const reviews = props.reviewsSnapshot?.data?.reviews ?? []
  const gitlabBaseUrl = props.reviewsSnapshot?.data?.gitlabBaseUrl ?? 'https://git.sutunam.com'
  const recentReviews = reviews.slice(0, 3)

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <HeroKpi kpis={kpis.map((k: any) => ({ ...k, sub: k.id === 'tunnel' ? (tunnel?.hostname ?? k.value) : undefined }))} />

      {/* Bento 2-col: Heatmap + Mini trend */}
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: '1.2fr .8fr' }} data-bento="heatmap-trend">
        <style>{`@media (max-width: 1024px) { [data-bento="heatmap-trend"] { grid-template-columns: 1fr !important; } }`}</style>

        <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 16, background: 'var(--dsw-alias-bg-layer-1)', padding: 16, display: 'grid', gap: 12, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)' }}>Activity</div>
            <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', background: 'var(--dsw-alias-bg-base)', border: '1px solid var(--dsw-alias-border-l1)', padding: '2px 8px', borderRadius: 999 }}>53 weeks</span>
          </div>
          <div style={{ width: '100%', minWidth: 0 }}>
            <Heatmap data={heatmap} />
          </div>
        </div>

        <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 16, background: 'var(--dsw-alias-bg-layer-1)', padding: 16, display: 'grid', gap: 12, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)' }}>Cost trend</div>
            <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>¥{Number(totals.cost ?? 0).toFixed(2)} · {daily.length}d</span>
          </div>
          <Sparkline data={daily.map((d: any) => Number(d.cost ?? 0))} height={64} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { k: 'Requests', v: String(totals.requests ?? 0) },
              { k: 'Tokens', v: Number(totals.tokens ?? 0).toLocaleString() },
              { k: 'Avg', v: `¥${((Number(totals.cost ?? 0) / Math.max(1, Number(totals.requests ?? 0)))).toFixed(4)}` },
            ].map((s) => (
              <span key={s.k} style={{ flex: '1 1 auto', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 10, padding: '8px 10px', background: 'var(--dsw-alias-bg-base)', display: 'grid', gap: 2, minWidth: 90 }}>
                <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>{s.k}</span>
                <span style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)' }}>{s.v}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {tunnel && (tunnel.hostname || tunnel.mode || tunnel.id) && (
        <div
          data-tunnel-card
          style={{
            border: '1px solid var(--dsw-alias-border-l2)',
            borderRadius: 16,
            background: 'var(--dsw-alias-bg-layer-1)',
            padding: 16,
            display: 'grid',
            gap: 12,
            minWidth: 0,
          }}
        >
          <style>{`
            @media (max-width: 640px) {
              [data-tunnel-card] { padding: 14px !important; gap: 10px !important; }
              [data-tunnel-head] { gap: 10px !important; }
              [data-tunnel-urlbox] { padding: 10px 12px !important; }
            }
          `}</style>
          <div data-tunnel-head style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minWidth: 0 }}>
            <span style={{ width: 36, height: 36, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: tunnel.hostname ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-bg-base)', color: tunnel.hostname ? '#fff' : 'var(--dsw-alias-label-secondary)', border: `1px solid ${tunnel.hostname ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-border-l1)'}`, flex: 'none', boxShadow: tunnel.hostname ? '0 0 0 4px color-mix(in srgb, var(--dsw-alias-state-success-primary) 12%, transparent)' : 'none' }}>
              <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 8a6 6 0 0 1 12 0M4 8a3 3 0 0 1 8 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><circle cx="8" cy="8" r="1.6" fill="currentColor" /></svg>
            </span>
            <div style={{ minWidth: 0, flex: '1 1 auto', display: 'grid', gap: 4 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', minWidth: 0 }}>
                <span style={{ font: 'var(--dsw-font-s-strong-14)', color: 'var(--dsw-alias-label-primary)', lineHeight: 1 }}>Tunnel</span>
                <span style={{ font: 'var(--dsw-font-xxs-12)', padding: '3px 8px', borderRadius: 999, background: tunnel.hostname ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-warn-primary)', color: '#fff', fontWeight: 700, letterSpacing: '.02em', flex: 'none', marginLeft: 'auto' }}>{tunnel.hostname ? '● active' : tunnel.mode ?? 'configured'}</span>
                {tunnel.hasCredentials === false && <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-state-warn-primary)', background: 'var(--dsw-alias-bg-base)', border: '1px solid var(--dsw-alias-border-l1)', padding: '2px 8px', borderRadius: 999 }}>no credentials</span>}
              </div>
              <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', fontFamily: 'var(--ds-font-family-code)' as any }}>
                {tunnel.mode && <span style={{ background: 'var(--dsw-alias-bg-base)', border: '1px solid var(--dsw-alias-border-l1)', padding: '2px 8px', borderRadius: 999, color: 'var(--dsw-alias-label-secondary)' }}>{tunnel.mode}</span>}
                {tunnel.id && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as any, maxWidth: '100%' }}>{tunnel.id.slice(0, 16)}</span>}
                {!tunnel.hostname && !tunnel.mode && !tunnel.id && <span style={{ color: 'var(--dsw-alias-label-tertiary)' }}>No tunnel configured</span>}
              </div>
            </div>
          </div>

          {tunnel.hostname ? (
            <div data-tunnel-urlbox style={{ display: 'flex', gap: 8, alignItems: 'stretch', minWidth: 0, background: 'var(--dsw-alias-bg-base)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 12, padding: '8px 8px 8px 12px', minHeight: 44 }}>
              <div style={{ flex: '1 1 auto', minWidth: 0, display: 'grid', gap: 2, alignContent: 'center' }}>
                <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', letterSpacing: '.04em', textTransform: 'uppercase' as any }}>Public URL</div>
                <a href={`https://${tunnel.hostname}`} target="_blank" rel="noreferrer" style={{ font: 'var(--dsw-font-xs-13)', fontFamily: 'var(--ds-font-family-code)' as any, color: 'var(--dsw-alias-brand-primary)', textDecoration: 'none', wordBreak: 'break-all', lineHeight: 1.4 }}>https://{tunnel.hostname}</a>
              </div>
              <button
                onClick={() => navigator.clipboard?.writeText(`https://${tunnel.hostname}`)}
                aria-label="Copy tunnel URL"
                style={{ flex: 'none', alignSelf: 'center', width: 32, height: 32, borderRadius: 8, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                title="Copy"
              >
                <svg width={14} height={14} viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M3 8.5V3.5A1.5 1.5 0 0 1 4.5 2H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
              </button>
            </div>
          ) : (
            <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)', background: 'var(--dsw-alias-bg-base)', border: '1px dashed var(--dsw-alias-border-l1)', borderRadius: 12, padding: '10px 12px', lineHeight: 1.5 }}>Tunnel not active — run <code style={{ fontFamily: 'var(--ds-font-family-code)', background: 'var(--dsw-alias-bg-layer-2)', padding: '1px 6px', borderRadius: 6 }}>maestro tunnel</code> or configure in Settings.</div>
          )}

          {tunnel.hostname && (
            <div data-tunnel-actions style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigator.clipboard?.writeText(`https://${tunnel.hostname}`)}
                style={{ height: 32, font: 'var(--dsw-font-xs-13)', fontWeight: 500, padding: '0 12px', borderRadius: 999, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-base)', color: 'var(--dsw-alias-label-primary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', flex: '0 0 auto' }}
              >
                <svg width={14} height={14} viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M3 8.5V3.5A1.5 1.5 0 0 1 4.5 2H9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                Copy
              </button>
              <a href={`https://${tunnel.hostname}`} target="_blank" rel="noreferrer" style={{ height: 32, font: 'var(--dsw-font-xs-13)', fontWeight: 500, padding: '0 12px', borderRadius: 999, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-base)', color: 'var(--dsw-alias-brand-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, flex: '0 0 auto' }}>
                Open
                <svg width={12} height={12} viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 11L11 5M11 5H6M11 5V10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Reviews — preview 3, link to full */}
      <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 16, background: 'var(--dsw-alias-bg-layer-1)', padding: 16, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)', display: 'flex', gap: 8, alignItems: 'center' }}>
            Recent reviews <span style={{ font: 'var(--dsw-font-xxs-12)', minWidth: 20, height: 20, padding: '0 6px', borderRadius: 999, background: 'var(--dsw-alias-bg-base)', border: '1px solid var(--dsw-alias-border-l1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dsw-alias-label-secondary)' }}>{reviews.length}</span>
          </div>
          <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>{reviews.length ? `${recentReviews.length} shown` : 'No reviews yet'}</span>
        </div>

        {!reviews.length ? (
          <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)', padding: '8px 0' }}>No reviews yet — trigger a Maestro Review from the MR note.</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {recentReviews.map((r: any) => {
              const mrUrl = r.projectPath && r.mrIid ? `${gitlabBaseUrl}/${r.projectPath}/-/merge_requests/${r.mrIid}` : ''
              return (
                <div key={r.id} style={{ border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 12, padding: 12, display: 'grid', gap: 8, background: 'var(--dsw-alias-bg-base)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', minWidth: 0 }}>
                    <span style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as any }}>{r.projectPath} !{r.mrIid}</span>
                    <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginLeft: 'auto', whiteSpace: 'nowrap' as any }}>{formatTime(r.startedAt)} · {formatDuration(r.durationMs)}</span>
                    <span style={{ font: 'var(--dsw-font-xxs-12)', padding: '2px 8px', borderRadius: 999, background: r.status === 'completed' ? 'var(--dsw-alias-state-success-primary)' : r.status === 'running' ? 'var(--dsw-alias-state-warn-primary)' : 'var(--dsw-alias-bg-layer-2)', color: r.status === 'completed' || r.status === 'running' ? '#fff' : 'var(--dsw-alias-label-secondary)', border: '1px solid var(--dsw-alias-border-l1)', fontWeight: 600, flex: 'none', textTransform: 'capitalize' as any }}>{r.status}</span>
                  </div>
                  {r.summary && <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', display: '-webkit-box', WebkitLineClamp: 3 as any, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{r.summary.slice(0, 400)}</div>}
                  {mrUrl && (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <a href={mrUrl} target="_blank" rel="noreferrer" style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-brand-primary)', textDecoration: 'none', wordBreak: 'break-all' }}>{mrUrl}</a>
                    </div>
                  )}
                </div>
              )
            })}
            {reviews.length > 3 && <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', textAlign: 'center' as any }}>+ {reviews.length - 3} more — see Reviews tab</div>}
          </div>
        )}
      </div>
    </div>
  )
}
