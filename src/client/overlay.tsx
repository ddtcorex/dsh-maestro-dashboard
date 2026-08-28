import * as React from 'react'
import { OverviewTab } from './tabs/OverviewTab.tsx'

export function Overlay(props: { onClose?: () => void; children?: React.ReactNode; overview?: any; plugins?: any; usage?: any; reviews?: any; usageRange?: '7d' | '30d'; onUsageRangeChange?: (r: '7d' | '30d') => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'var(--dsw-alias-bg-base)',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
      role="dialog"
      aria-label="Maestro Dashboard"
      data-maestro-overlay
    >
      <style>{`
        [data-heatmap-wrap] { overflow-x:auto; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        [data-heatmap] { min-width: max-content; overflow-x:auto; }
        @media (max-width: 390px) {
          [data-maestro-content] { padding: 12px !important; }
        }
      `}</style>
      <header
        data-maestro-header
        style={{
          height: 56,
          minHeight: 56,
          flexShrink: 0,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          borderBottom: '1px solid var(--dsw-alias-border-l2)',
        }}
      >
        <div style={{ font: 'var(--dsw-font-s-strong-14)', letterSpacing: '.02em', color: 'var(--dsw-alias-label-primary)' }}>
          Maestro Dashboard
        </div>
        <button
          onClick={props.onClose}
          style={{
            flex: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            border: 'none',
            borderRadius: 8,
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--dsw-alias-label-secondary)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          aria-label="Close"
        >
          <svg width={14} height={14} viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </header>

      <div data-maestro-content style={{ maxWidth: 1120, margin: '0 auto', padding: 16, display: 'grid', gap: 16, boxSizing: 'border-box', width: '100%' }}>
        <OverviewTab snapshot={props.overview} reviewsSnapshot={props.reviews} usage={props.usage} usageRange={props.usageRange} onUsageRangeChange={props.onUsageRangeChange} />
        {props.children}
      </div>
    </div>
  )
}
