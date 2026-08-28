import * as React from 'react'
import { PluginCard } from '../components/PluginCard.tsx'
export function PluginsTab(props: { snapshot?: any }) {
  const installed = props.snapshot?.data?.installed ?? []
  const [tab, setTab] = React.useState<'installed' | 'marketplace' | 'updates'>('installed')
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['installed', 'marketplace', 'updates'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              height: 28,
              padding: '0 12px',
              borderRadius: 14,
              border: 'none',
              background: tab === t ? 'var(--dsw-alias-button-ghost-active-fill)' : 'transparent',
              color: tab === t ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-secondary)',
              cursor: 'pointer',
              textTransform: 'capitalize',
              font: 'var(--dsw-font-xs-13)',
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === 'installed' && (
        <div style={{ display: 'grid', gap: 8 }}>
          {installed.length ? installed.map((p: any) => <PluginCard key={p.id} {...p} />) : <div style={{ color: 'var(--dsw-alias-label-tertiary)', font: 'var(--dsw-font-xs-13)' }}>No plugins installed</div>}
        </div>
      )}
      {tab === 'marketplace' && <div style={{ color: 'var(--dsw-alias-label-secondary)', font: 'var(--dsw-font-xs-13)' }}>Marketplace — curated maestro plugins (jsDelivr index, 10m cache)</div>}
      {tab === 'updates' && <div style={{ color: 'var(--dsw-alias-label-secondary)', font: 'var(--dsw-font-xxs-12)' }}>Updates — npm dist-tags diff</div>}
    </div>
  )
}
