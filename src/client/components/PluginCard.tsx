import * as React from 'react'
export function PluginCard(props: { id: string; name: string; version: string; status: string; updateAvailable?: boolean }) {
  return (
    <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, background: 'var(--dsw-alias-bg-layer-1)', padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)' }}>{props.name}</div>
        <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>{props.version} · {props.status}</div>
      </div>
      <button style={{ height: 28, padding: '0 10px', borderRadius: 14, border: 'none', background: 'var(--dsw-alias-interactive-bg-hover)', cursor: 'pointer', font: 'var(--dsw-font-xs-13)' }}>
        {props.updateAvailable ? 'Update' : 'Enabled'}
      </button>
    </div>
  )
}
