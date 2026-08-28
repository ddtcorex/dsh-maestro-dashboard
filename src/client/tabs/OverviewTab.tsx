import * as React from 'react'
import { HeroKpi } from '../components/HeroKpi.tsx'
import { Heatmap } from '../components/Heatmap.tsx'
import { Sparkline } from '../components/Sparkline.tsx'
import { PricingTable } from '../components/PricingTable.tsx'
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
export function OverviewTab(props: { snapshot?: any; reviewsSnapshot?: any; usage?: any; usageRange?: '7d' | '30d' | undefined; onUsageRangeChange?: ((r: '7d' | '30d') => void) | undefined }) {
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
  const usageData = props.usage?.data
  const totals = usageData?.totals ?? { cost: 0, tokens: 0, requests: 0 }
  const daily: Array<{ date: string; cost: number; tokens: number }> = usageData?.daily ?? []
  const pricing: Array<{ model: string; input: number; output: number }> = usageData?.pricing ?? []
  const budget = usageData?.budget as { limit: number; used: number } | undefined
  const range = props.usageRange ?? '7d'
  const budgetPct = budget ? Math.min(100, Math.round((budget.used / Math.max(1, budget.limit)) * 100)) : 0
  const budgetColor = budgetPct >= 100 ? 'var(--dsw-alias-state-error-primary)' : budgetPct >= 80 ? 'var(--dsw-alias-state-warn-primary)' : 'var(--dsw-alias-brand-primary)'
  const tunnel = (props.snapshot?.data as any)?.tunnel as { mode?: string; id?: string; hostname?: string; hasCredentials?: boolean } | undefined
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <HeroKpi kpis={kpis} />
      {tunnel && (tunnel.hostname || tunnel.mode || tunnel.id) && (
        <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, background: 'var(--dsw-alias-bg-layer-1)', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)', flex: 'none' }}>Tunnel</div>
          <span style={{ font: 'var(--dsw-font-xxs-12)', padding: '2px 8px', borderRadius: 10, background: tunnel.hostname ? 'var(--dsw-alias-state-success-subtle)' : 'var(--dsw-alias-state-warn-subtle)', color: tunnel.hostname ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-warn-primary)', border: '1px solid var(--dsw-alias-border-l1)', fontWeight: 600, flex: 'none' }}>{tunnel.hostname ? 'active' : tunnel.mode ?? 'configured'}</span>
          <span style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-primary)', flex: 'none' }} title={tunnel.hostname ? `https://${tunnel.hostname} · ${tunnel.mode ?? ''} ${tunnel.id ?? ''}`.trim() : ''}>{tunnel.hostname ? 'Enabled' : '—'}</span>
          <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', flex: 'none' }}>{tunnel.mode ?? ''}</span>
          {tunnel.hostname && (
            <>
              <button onClick={() => navigator.clipboard?.writeText(`https://${tunnel.hostname}`)} style={{ flex: 'none', font: 'var(--dsw-font-xxs-12)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-base)', cursor: 'pointer', color: 'var(--dsw-alias-label-primary)' }}>Copy</button>
              <a href={`https://${tunnel.hostname}`} target="_blank" rel="noreferrer" style={{ flex: 'none', font: 'var(--dsw-font-xxs-12)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-base)', color: 'var(--dsw-alias-link-default)', textDecoration: 'none' }}>Open</a>
            </>
          )}
        </div>
      )}
      <div data-heatmap-wrap style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, background: 'var(--dsw-alias-bg-layer-1)', padding: 16, overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
        <div style={{ font: 'var(--dsw-font-xs-strong-13)', marginBottom: 12, color: 'var(--dsw-alias-label-primary)' }}>Activity Heatmap (52 weeks)</div>
        <Heatmap data={heatmap} />
      </div>
      {/* Usage — always in overview, polished */}
      <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, background: 'var(--dsw-alias-bg-layer-1)', padding: 16, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ font: 'var(--dsw-font-s-strong-14)', color: 'var(--dsw-alias-label-primary)' }}>Usage</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => props.onUsageRangeChange?.(r)}
                style={{
                  height: 24,
                  padding: '0 10px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  font: 'var(--dsw-font-xxs-12)',
                  background: range === r ? 'var(--dsw-alias-button-ghost-active-fill)' : 'transparent',
                  color: range === r ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-secondary)',
                  boxShadow: range === r ? 'inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)' : 'none',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          <div style={{ border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 10, padding: '12px 14px', background: 'var(--dsw-alias-bg-base)' }}>
            <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>Cost</div>
            <div style={{ font: 'var(--dsw-font-s-strong-14)', color: 'var(--dsw-alias-label-primary)', marginTop: 4 }}>¥{Number(totals.cost ?? 0).toFixed(2)}</div>
            <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginTop: 2 }}>{range}</div>
          </div>
          <div style={{ border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 10, padding: '12px 14px', background: 'var(--dsw-alias-bg-base)' }}>
            <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>Tokens</div>
            <div style={{ font: 'var(--dsw-font-s-strong-14)', color: 'var(--dsw-alias-label-primary)', marginTop: 4 }}>{Number(totals.tokens ?? 0).toLocaleString()}</div>
            <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginTop: 2 }}>{Number(totals.requests ?? 0)} requests</div>
          </div>
          <div style={{ border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 10, padding: '12px 14px', background: 'var(--dsw-alias-bg-base)' }}>
            <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>Avg / request</div>
            <div style={{ font: 'var(--dsw-font-s-strong-14)', color: 'var(--dsw-alias-label-primary)', marginTop: 4 }}>¥{((Number(totals.cost ?? 0) / Math.max(1, Number(totals.requests ?? 0)))).toFixed(4)}</div>
            <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginTop: 2 }}>{daily.length} days</div>
          </div>
        </div>
        {budget && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-secondary)', marginBottom: 6 }}>
              <span>Budget</span>
              <span>{budget.used.toFixed(2)} / {budget.limit.toFixed(2)} ({budgetPct}%)</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' }}>
              <div style={{ width: `${budgetPct}%`, height: '100%', background: budgetColor, borderRadius: 4, transition: 'width .2s ease' }} />
            </div>
          </div>
        )}
        <div style={{ border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 10, background: 'var(--dsw-alias-bg-base)', padding: 12 }}>
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginBottom: 8 }}>Daily cost — {range}</div>
          <Sparkline data={daily.map((d: any) => Number(d.cost ?? 0))} />
        </div>
        {pricing.length > 0 && (
          <div>
            <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)', marginBottom: 8 }}>Pricing (used models only)</div>
            <PricingTable pricing={pricing} />
            <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginTop: 6 }}>Filtered to models with usage — not 5900</div>
          </div>
        )}
      </div>
      <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, background: 'var(--dsw-alias-bg-layer-1)', padding: 16, overflowX: 'auto' }}>
        <div style={{ font: 'var(--dsw-font-xs-strong-13)', marginBottom: 12, color: 'var(--dsw-alias-label-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>Recent reviews</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 20, padding: '0 8px', borderRadius: 10, background: 'var(--dsw-alias-state-success-subtle)', color: 'var(--dsw-alias-state-success-primary)', border: '1px solid var(--dsw-alias-border-l1)', font: 'var(--dsw-font-xxs-12)', fontWeight: 600 }}>{props.reviewsSnapshot?.data?.reviews?.length ?? 0}</span>
          </div>
          <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>from dsh-maestro-review</span>
        </div>
        {!props.reviewsSnapshot?.data?.reviews?.length ? (
          <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)' }}>No reviews yet</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {props.reviewsSnapshot.data.reviews.map((r: any) => {
              const base = props.reviewsSnapshot?.data?.gitlabBaseUrl ?? 'https://git.sutunam.com'
              const mrUrl = `${base.replace(/\/$/, '')}/${r.projectPath}/-/merge_requests/${r.mrIid}`
              const isCompleted = r.status === 'completed'
              const isFailed = r.status === 'failed'
              const statusIcon = isCompleted ? '✅' : isFailed ? '⚠️' : 'ℹ️'
              const statusText = isCompleted ? 'completed' : isFailed ? 'failed' : String(r.status)
              const summaryPart = r.summary ? `\n\n${String(r.summary).slice(0, 600)}` : r.error ? `\n\n${String(r.error).slice(0, 300)}` : ''
              const telegramText = `<b>🔎 Maestro Review</b> — ${r.projectPath} !${r.mrIid} — ${statusIcon} ${statusText}\n🔗 <a href="${mrUrl}">${mrUrl}</a>${summaryPart}`
              return (
                <div key={r.id} style={{ border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 10, padding: 14, display: 'grid', gap: 10, background: 'var(--dsw-alias-bg-base)' }}>
                  {/* Header: MR link + status */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <a href={mrUrl} target="_blank" rel="noreferrer" style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-link-default)', textDecoration: 'none', wordBreak: 'break-all' }} title={mrUrl}>{mrUrl}</a>
                    <span style={{ font: 'var(--dsw-font-xxs-12)', padding: '2px 8px', borderRadius: 10, background: r.status === 'completed' ? 'var(--dsw-alias-state-success-subtle)' : r.status === 'failed' ? 'var(--dsw-alias-state-error-subtle)' : r.status === 'running' ? 'var(--dsw-alias-state-warn-subtle)' : 'var(--dsw-alias-bg-layer-2)', color: r.status === 'completed' ? 'var(--dsw-alias-state-success-primary)' : r.status === 'failed' ? 'var(--dsw-alias-state-error-primary)' : r.status === 'running' ? 'var(--dsw-alias-state-warn-primary)' : 'var(--dsw-alias-label-secondary)', border: '1px solid var(--dsw-alias-border-l1)', fontWeight: 600 }}>{r.status}</span>
                    <span style={{ font: 'var(--dsw-font-xxs-12)', padding: '2px 6px', borderRadius: 6, background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', color: 'var(--dsw-alias-label-secondary)' }}>{r.mode} · {r.scope} · {r.trigger}</span>
                    <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginLeft: 'auto' }}>{formatTime(r.startedAt)} · {formatDuration(r.durationMs)} · {r.headSha.slice(0, 7)}</span>
                  </div>
                  {/* Summary / error — polished */}
                  {r.error && r.status === 'failed' && <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-state-error-primary)', background: 'var(--dsw-alias-state-error-subtle)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 8, padding: '8px 10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.error.slice(0, 800)}</div>}
                  {r.summary && <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '18px', maxHeight: 84, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.summary.slice(0, 800)}</div>}
                  {/* Full MR URL row with copy */}
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 8, padding: '6px 8px' }}>
                    <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mrUrl}</span>
                    <button onClick={() => navigator.clipboard?.writeText(mrUrl)} style={{ flex: 'none', font: 'var(--dsw-font-xxs-12)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-base)', cursor: 'pointer', color: 'var(--dsw-alias-label-primary)' }}>Copy link</button>
                    <a href={mrUrl} target="_blank" rel="noreferrer" style={{ flex: 'none', font: 'var(--dsw-font-xxs-12)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-base)', color: 'var(--dsw-alias-link-default)', textDecoration: 'none' }}>Open</a>
                  </div>
                  {/* Telegram message preview — at least one */}
                  <div style={{ border: '1px dashed var(--dsw-alias-border-l2)', borderRadius: 8, padding: '8px 10px', background: 'var(--dsw-alias-bg-layer-1)', display: 'grid', gap: 6 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ font: 'var(--dsw-font-xxs-12)', fontWeight: 600, color: 'var(--dsw-alias-label-primary)' }}>Telegram</span>
                      <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>preview — sent via maestro-notifier</span>
                      <button onClick={() => navigator.clipboard?.writeText(telegramText)} style={{ marginLeft: 'auto', font: 'var(--dsw-font-xxs-12)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-base)', cursor: 'pointer' }}>Copy Telegram text</button>
                    </div>
                    <pre style={{ margin: 0, font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '16px', maxHeight: 96, overflow: 'auto' }}>{telegramText.slice(0, 900)}</pre>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
