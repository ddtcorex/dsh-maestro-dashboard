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
  const heatmap = props.snapshot?.data?.heatmap ?? Array.from({ length: 52 * 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (364 - 1 - i))
    return { date: d.toISOString().slice(0, 10), count: Math.floor(Math.random() * 5) }
  })
  const usageData = props.usage?.data
  const totals = usageData?.totals ?? { cost: 0, tokens: 0, requests: 0, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 }
  const daily: Array<{ date: string; cost: number; tokens: number; inputTokens?: number; outputTokens?: number; cacheReadTokens?: number; cacheWriteTokens?: number }> = usageData?.daily ?? []
  const pricing: Array<{ model: string; input: number; output: number }> = usageData?.pricing ?? []
  const budget = usageData?.budget as { limit: number; used: number } | undefined
  const range = props.usageRange ?? '7d'
  const budgetPct = budget ? Math.min(100, Math.round((budget.used / Math.max(1, budget.limit)) * 100)) : 0
  const budgetColor = budgetPct >= 100 ? 'var(--dsw-alias-state-error-primary)' : budgetPct >= 80 ? 'var(--dsw-alias-state-warn-primary)' : 'var(--dsw-alias-brand-primary)'
  const tunnel = (props.snapshot?.data as any)?.tunnel as { mode?: string; id?: string; hostname?: string; hasCredentials?: boolean } | undefined
  const reviews = props.reviewsSnapshot?.data?.reviews ?? []
  const gitlabBaseUrl = props.reviewsSnapshot?.data?.gitlabBaseUrl ?? 'https://git.sutunam.com'
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <HeroKpi kpis={kpis} />
      {tunnel && (tunnel.hostname || tunnel.mode || tunnel.id) && (
        <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, background: 'var(--dsw-alias-bg-layer-1)', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)', flex: 'none' }}>Tunnel</div>
          <span style={{ font: 'var(--dsw-font-xxs-12)', padding: '2px 8px', borderRadius: 10, background: tunnel.hostname ? 'var(--dsw-alias-state-success-subtle)' : 'var(--dsw-alias-state-warn-subtle)', color: tunnel.hostname ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-warn-primary)', border: '1px solid var(--dsw-alias-border-l1)', fontWeight: 600, flex: 'none' }}>{tunnel.hostname ? 'active' : tunnel.mode ?? 'configured'}</span>
          <span style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-primary)', flex: 'none' }} title={tunnel.hostname ? `https://${tunnel.hostname} · ${tunnel.mode ?? ''} ${tunnel.id ?? ''}`.trim() : ''}>{tunnel.hostname ? 'enabled' : '—'}</span>
          {tunnel.hostname && <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', flex: '1 1 auto', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as any }} title={`https://${tunnel.hostname}`}>{tunnel.hostname}</span>}
          <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', flex: 'none' }}>{tunnel.mode ?? ''}{tunnel.id ? ` · ${tunnel.id.slice(0, 8)}` : ''}</span>
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
            <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginTop: 2 }}>{Number(totals.requests ?? 0)} requests · {range}</div>
          </div>
          <div style={{ border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 10, padding: '12px 14px', background: 'var(--dsw-alias-bg-base)' }}>
            <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>Tokens</div>
            <div style={{ font: 'var(--dsw-font-s-strong-14)', color: 'var(--dsw-alias-label-primary)', marginTop: 4 }}>{Number(totals.tokens ?? 0).toLocaleString()}</div>
            <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-secondary)', marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span>In {Number(totals.inputTokens ?? 0).toLocaleString()}</span><span>·</span><span>Out {Number(totals.outputTokens ?? 0).toLocaleString()}</span>{totals.cacheReadTokens ? <><span>·</span><span>Cache {Number(totals.cacheReadTokens).toLocaleString()}</span></> : null}
            </div>
            <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginTop: 2 }}>{Number(totals.requests ?? 0)} requests</div>
          </div>
          <div style={{ border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 10, padding: '12px 14px', background: 'var(--dsw-alias-bg-base)' }}>
            <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>Avg / request</div>
            <div style={{ font: 'var(--dsw-font-s-strong-14)', color: 'var(--dsw-alias-label-primary)', marginTop: 4 }}>¥{((Number(totals.cost ?? 0) / Math.max(1, Number(totals.requests ?? 0)))).toFixed(4)}</div>
            <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginTop: 2 }}>{daily.length} days</div>
          </div>
        </div>
        {budget && (
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>
              <span>Budget</span>
              <span>{budget.used.toFixed(2)} / {budget.limit.toFixed(2)} ({budgetPct}%)</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' }}>
              <div style={{ width: `${budgetPct}%`, height: '100%', background: budgetColor, borderRadius: 4 }} />
            </div>
          </div>
        )}
        <div style={{ border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 10, padding: 12, background: 'var(--dsw-alias-bg-base)' }}>
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginBottom: 8 }}>Daily cost — {range}</div>
          <Sparkline data={daily.map((d: any) => d.cost)} />
        </div>
        <div>
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginBottom: 6 }}>Pricing (used models only)</div>
          <PricingTable pricing={pricing} />
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginTop: 6 }}>Filtered to models with usage in selected range.</div>
        </div>
      </div>
      <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, background: 'var(--dsw-alias-bg-layer-1)', padding: 16 }}>
        <div style={{ font: 'var(--dsw-font-xs-strong-13)', marginBottom: 12, color: 'var(--dsw-alias-label-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Recent reviews</span>
          <span style={{ font: 'var(--dsw-font-xxs-12)', padding: '2px 8px', borderRadius: 10, background: 'var(--dsw-alias-state-success-subtle)', color: 'var(--dsw-alias-state-success-primary)', border: '1px solid var(--dsw-alias-border-l1)', minWidth: 22, height: 20, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{reviews.length}</span>
        </div>
        {!reviews.length ? (
          <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)' }}>No reviews yet</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {reviews.map((r: any) => {
              const mrUrl = r.projectPath && r.mrIid ? `${gitlabBaseUrl}/${r.projectPath}/-/merge_requests/${r.mrIid}` : ''
              return (
                <div key={r.id} style={{ border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 8, padding: 12, display: 'grid', gap: 6, background: 'var(--dsw-alias-bg-base)' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)' }}>{r.projectPath} !{r.mrIid}</span>
                    <span style={{ font: 'var(--dsw-font-xxs-12)', padding: '2px 6px', borderRadius: 10, background: r.status === 'completed' ? 'var(--dsw-alias-state-success-subtle)' : r.status === 'running' ? 'var(--dsw-alias-state-warn-subtle)' : 'var(--dsw-alias-bg-layer-2)', color: r.status === 'completed' ? 'var(--dsw-alias-state-success-primary)' : r.status === 'running' ? 'var(--dsw-alias-state-warn-primary)' : 'var(--dsw-alias-label-secondary)', border: '1px solid var(--dsw-alias-border-l1)' }}>{r.status}</span>
                    <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>{r.mode} · {r.scope} · {r.trigger}</span>
                    <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginLeft: 'auto' }}>{formatTime(r.startedAt)} · {formatDuration(r.durationMs)} · {r.headSha.slice(0, 7)}</span>
                  </div>
                  {r.summary && <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 84, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.summary.slice(0, 600)}</div>}
                  {r.error && <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-state-error-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{r.error.slice(0, 400)}</div>}
                  {mrUrl && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                      <a href={mrUrl} target="_blank" rel="noreferrer" style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-link-default)', textDecoration: 'none', wordBreak: 'break-all' }}>{mrUrl}</a>
                      <button onClick={() => navigator.clipboard?.writeText(mrUrl)} style={{ font: 'var(--dsw-font-xxs-12)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-base)', cursor: 'pointer', color: 'var(--dsw-alias-label-primary)' }}>Copy link</button>
                      <a href={mrUrl} target="_blank" rel="noreferrer" style={{ font: 'var(--dsw-font-xxs-12)', padding: '2px 8px', borderRadius: 6, border: '1px solid var(--dsw-alias-border-l1)', background: 'var(--dsw-alias-bg-base)', color: 'var(--dsw-alias-link-default)', textDecoration: 'none' }}>Open</a>
                    </div>
                  )}
                  {r.summary && mrUrl && (
                    <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 6, padding: '6px 8px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      <b>🔎 Maestro Review</b> — {r.projectPath} !{r.mrIid} — {r.status === 'completed' ? '✅' : '⚠️'}<br />
                      🔗 <a href={mrUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--dsw-alias-link-default)' }}>{mrUrl}</a><br /><br />{r.summary.slice(0, 800)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
