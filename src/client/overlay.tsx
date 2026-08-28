import * as React from 'react'
import { OverviewTab } from './tabs/OverviewTab.tsx'
import { PluginsTab } from './tabs/PluginsTab.tsx'
import { UsageTab } from './tabs/UsageTab.tsx'

export function Overlay(props: { onClose?: () => void; children?: React.ReactNode; overview?: any; plugins?: any; usage?: any; reviews?: any; usageRange?: '7d' | '30d'; onUsageRangeChange?: (r: '7d' | '30d') => void }) {
  const [activeTab, setActiveTab] = React.useState<'Overview' | 'Plugins' | 'Usage'>('Overview')
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
        [data-maestro-tabs] { overflow-x:auto; overflow-x: auto; flex-wrap: nowrap; -webkit-overflow-scrolling: touch; scrollbar-width: none; -ms-overflow-style: none; }
        [data-maestro-tabs]::-webkit-scrollbar { display: none; }
        [data-heatmap-wrap] { overflow-x:auto; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        [data-heatmap] { min-width: max-content; overflow-x:auto; }
        @media (max-width: 390px) {
          [data-maestro-content] { padding: 12px !important; }
          [data-maestro-tabs] { padding: 12px 12px !important; }
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

      <div
        data-maestro-tabs
        style={{
          display: 'flex',
          gap: 8,
          padding: '12px 16px',
          borderBottom: '1px solid var(--dsw-alias-border-l2)',
          overflowX: 'auto',
          flexWrap: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none' as any,
        }}
      >
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
                font: 'var(--dsw-font-xs-13)',
                background: active ? 'var(--dsw-alias-button-ghost-active-fill)' : 'transparent',
                color: active ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-secondary)',
                boxShadow: active ? 'inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)' : 'none',
                flexShrink: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {tab}
            </button>
          )
        })}
      </div>

      <div data-maestro-content style={{ maxWidth: 1120, margin: '0 auto', padding: 16, display: 'grid', gap: 16, boxSizing: 'border-box', width: '100%' }}>
        {activeTab === 'Overview' && <OverviewTab snapshot={props.overview} reviewsSnapshot={props.reviews} />}
        {activeTab === 'Plugins' && <PluginsTab snapshot={props.plugins} />}
        {activeTab === 'Usage' &&
          (props.usageRange !== undefined && props.onUsageRangeChange !== undefined ? (
            <UsageTab snapshot={props.usage} range={props.usageRange} onRangeChange={props.onUsageRangeChange} />
          ) : props.usageRange !== undefined ? (
            <UsageTab snapshot={props.usage} range={props.usageRange} />
          ) : props.onUsageRangeChange !== undefined ? (
            <UsageTab snapshot={props.usage} onRangeChange={props.onUsageRangeChange} />
          ) : (
            <UsageTab snapshot={props.usage} />
          ))}
        {props.children}
      </div>
    </div>
  )
}
