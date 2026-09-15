import * as React from 'react'

export type ActivityTools = Array<{ tool: string; calls: number }>

export type ActivityErrors = Array<{
  tool: string
  signature: string
  count: number
  firstTs: number
  lastTs: number
  exampleSession?: string
}>

export type ActivityLatency = { count: number; p50: number; p95: number; p99: number }

export type ActivityData = { tools: ActivityTools; errors: ActivityErrors; latency: ActivityLatency } | null

function fmtTs(ts: number): string {
  try {
    return new Date(ts).toLocaleString()
  } catch {
    return String(ts)
  }
}

export function ActivityTab(props: { activity?: ActivityData }) {
  const activity = props.activity ?? null
  if (!activity) return null
  const tools = [...(activity.tools ?? [])].sort((a, b) => b.calls - a.calls)
  const errors = [...(activity.errors ?? [])].sort((a, b) => b.count - a.count)
  const latency = activity.latency ?? { count: 0, p50: 0, p95: 0, p99: 0 }
  const hasLatency = latency.count > 0

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ font: 'var(--dsw-font-s-strong-14)', color: 'var(--dsw-alias-label-primary)', margin: 0 }}>Activity</h2>
        <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>Live tool telemetry · observe</span>
      </div>

      {/* Latency percentiles */}
      <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 16, background: 'var(--dsw-alias-bg-layer-1)', padding: 16, display: 'grid', gap: 12 }}>
        <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)' }}>Tool latency</div>
        {!hasLatency ? (
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>No latency samples captured yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(4, minmax(0,1fr))' }} data-activity-latency>
            <style>{`
              @media (max-width: 768px) { [data-activity-latency] { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } }
            `}</style>
            {[
              { label: 'Samples', value: String(latency.count) },
              { label: 'p50', value: `${Math.round(latency.p50)} ms` },
              { label: 'p95', value: `${Math.round(latency.p95)} ms` },
              { label: 'p99', value: `${Math.round(latency.p99)} ms` },
            ].map((k) => (
              <div key={k.label} style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 16, padding: '14px 16px', background: 'var(--dsw-alias-bg-layer-1)' }}>
                <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', letterSpacing: '.04em', textTransform: 'uppercase' as any }}>{k.label}</div>
                <div style={{ font: 'var(--dsw-font-markdown-h3)', color: 'var(--dsw-alias-label-primary)', marginTop: 6 }}>{k.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Per-tool call counts (recent ring) */}
      <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 16, background: 'var(--dsw-alias-bg-layer-1)', padding: 16, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)' }}>Calls by tool</div>
          <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>recent events</span>
        </div>
        {tools.length === 0 ? (
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>No tool activity recorded yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 6 }} role="table" aria-label="Calls by tool">
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 80px', gap: 8, font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', textTransform: 'uppercase' as any, letterSpacing: '.04em' }} role="row">
              <span>Tool</span><span style={{ textAlign: 'right' }}>Calls</span>
            </div>
            {tools.map((t) => (
              <div key={t.tool} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 80px', gap: 8, font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-primary)', borderTop: '1px solid var(--dsw-alias-border-l1)', paddingTop: 6 }} role="row">
                <span style={{ overflowWrap: 'anywhere', fontWeight: 600 }}>{t.tool || '(unknown)'}</span>
                <span style={{ textAlign: 'right' }}>{Number(t.calls ?? 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error groups */}
      <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 16, background: 'var(--dsw-alias-bg-layer-1)', padding: 16, display: 'grid', gap: 12 }}>
        <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)' }}>Errors</div>
        {errors.length === 0 ? (
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>No errors recorded.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {errors.map((e, i) => (
              <div key={`${e.tool}-${i}`} style={{ border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 8, padding: '8px 10px', background: 'var(--dsw-alias-bg-base)', display: 'grid', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', font: 'var(--dsw-font-xxs-12)' }}>
                  <span style={{ color: 'var(--dsw-alias-label-primary)', fontWeight: 600, overflowWrap: 'anywhere' }}>{e.tool || '(unknown)'}</span>
                  <span style={{ color: 'var(--dsw-alias-state-error-primary)', fontWeight: 600 }}>×{e.count}</span>
                </div>
                {e.signature ? (
                  <div style={{ fontFamily: 'var(--ds-font-family-code)', fontSize: 11, color: 'var(--dsw-alias-label-secondary)', overflowWrap: 'anywhere' }}>{e.signature}</div>
                ) : null}
                <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>Last seen {fmtTs(e.lastTs)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
