import * as React from 'react'

export type Kpi = { id: string; label: string; value: string; sub?: string; status: 'ok' | 'warn' | 'error'; icon?: React.ReactNode }

function StatusDot({ status }: { status: 'ok' | 'warn' | 'error' }) {
  const bg =
    status === 'ok'
      ? 'var(--dsw-alias-state-success-primary)'
      : status === 'warn'
        ? 'var(--dsw-alias-state-warn-primary)'
        : 'var(--dsw-alias-state-error-primary)'
  return <span aria-hidden style={{ width: 8, height: 8, borderRadius: 999, background: bg, flex: 'none', display: 'inline-block' }} />
}

function KpiIcon({ id }: { id: string }) {
  const common = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': 'true' } as any
  if (id === 'tunnel') return <svg {...common}><path d="M2 8a6 6 0 0 1 12 0M5 8a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /><circle cx="8" cy="8" r="1.5" fill="currentColor" /></svg>
  if (id === 'review') return <svg {...common}><path d="M3 3h10v8H6l-3 3V3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
  if (id === 'govard') return <svg {...common}><rect x="3" y="3" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" /><path d="M6 8h4M8 6v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
  return <svg {...common}><path d="M8 3l6 4-6 4-6-4 6-4zM2 11l6 3 6-3" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
}

export function HeroKpi(props: { kpis: Kpi[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gap: 12,
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      }}
      data-kpi-grid
    >
      <style>{`
        @media (max-width: 1024px) { [data-kpi-grid] { grid-template-columns: repeat(2, minmax(0,1fr)) !important; } }
        @media (max-width: 640px) { [data-kpi-grid] { grid-template-columns: 1fr !important; } }
      `}</style>
      {props.kpis.map((k) => (
        <div
          key={k.id}
          data-testid="kpi"
          style={{
            border: '1px solid var(--dsw-alias-border-l2)',
            borderRadius: 16,
            background: 'var(--dsw-alias-bg-layer-1)',
            padding: '14px 14px 12px',
            display: 'grid',
            gap: 8,
            minWidth: 0,
            transition: 'background 200ms ease, border-color 200ms ease, transform 150ms ease',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.background = 'var(--dsw-alias-bg-layer-2)'
            el.style.borderColor = 'var(--dsw-alias-border-l3)'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLDivElement
            el.style.background = 'var(--dsw-alias-bg-layer-1)'
            el.style.borderColor = 'var(--dsw-alias-border-l2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--dsw-alias-bg-base)',
                border: '1px solid var(--dsw-alias-border-l1)',
                color: 'var(--dsw-alias-label-secondary)',
                flex: 'none',
              }}
            >
              <KpiIcon id={k.id} />
            </span>
            <StatusDot status={k.status} />
          </div>
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', letterSpacing: '.02em' }}>{k.label}</div>
          <div style={{ font: 'var(--dsw-font-markdown-h3)', color: 'var(--dsw-alias-label-primary)', lineHeight: '1.2', wordBreak: 'break-word' }}>{k.value}</div>
          {k.sub && <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>{k.sub}</div>}
        </div>
      ))}
    </div>
  )
}
