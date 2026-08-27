import * as React from 'react'
export function HeroKpi(props: { kpis: Array<{ id: string; label: string; value: string; status: 'ok' | 'warn' | 'error' }> }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
      {props.kpis.map((k) => (
        <div
          key={k.id}
          data-testid="kpi"
          style={{
            border: '1px solid var(--dsw-alias-border-l2)',
            borderRadius: 12,
            background: 'var(--dsw-alias-bg-layer-1)',
            padding: 16,
          }}
        >
          <div style={{ fontSize: '12px', lineHeight: '16px', color: 'var(--dsw-alias-label-tertiary)' }}>{k.label}</div>
          <div style={{ font: 'var(--dsw-font-markdown-h1)', color: 'var(--dsw-alias-label-primary)', marginTop: 4 }}>{k.value}</div>
          <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 8, background: k.status === 'ok' ? 'var(--dsw-alias-state-success-primary)' : k.status === 'warn' ? 'var(--dsw-alias-state-warn-primary)' : 'var(--dsw-alias-state-error-primary)' }} />
        </div>
      ))}
    </div>
  )
}
