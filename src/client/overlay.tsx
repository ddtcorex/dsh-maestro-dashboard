import * as React from 'react'

export function Overlay(props: { onClose?: () => void; children?: React.ReactNode }) {
  const [activeTab, setActiveTab] = React.useState<'Overview' | 'Plugins' | 'Usage'>('Overview')
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'var(--dsw-alias-bg-base)',
        overflowY: 'auto',
      }}
      role="dialog"
      aria-label="Maestro Dashboard"
    >
      <header
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid var(--dsw-alias-border-l2)',
        }}
      >
        <div style={{ fontSize: '16px', lineHeight: '24px', fontWeight: 600, letterSpacing: '.08em', color: 'var(--dsw-alias-label-primary)' }}>
          Maestro Dashboard
        </div>
        <button
          onClick={props.onClose}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--dsw-alias-interactive-bg-hover)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close"
        >
          ✕
        </button>
      </header>

      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--dsw-alias-border-l2)' }}>
        {(['Overview', 'Plugins', 'Usage'] as const).map((tab) => {
          const active = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                height: 28,
                padding: '0 12px',
                borderRadius: 14,
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                lineHeight: '22px',
                background: active ? 'var(--dsw-alias-button-ghost-active-fill)' : 'transparent',
                color: active ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-secondary)',
                boxShadow: active ? 'inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)' : 'none',
              }}
            >
              {tab}
            </button>
          )
        })}
      </div>

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: 16, display: 'grid', gap: 16 }}>
        {activeTab === 'Overview' && <div data-testid="overview-content">Overview — health, KPIs, heatmap</div>}
        {activeTab === 'Plugins' && <div data-testid="plugins-content">Plugins — installed & marketplace</div>}
        {activeTab === 'Usage' && <div data-testid="usage-content">Usage — cost & pricing</div>}
        {props.children}
      </div>
    </div>
  )
}
