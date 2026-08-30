import * as React from 'react'

export type PluginInfo = {
  id: string
  name: string
  version: string
  status: 'ok' | 'warn' | 'error'
  updateAvailable?: boolean
  latest?: string
  description?: string
}

function StatusPill({ status }: { status: PluginInfo['status'] }) {
  const map: Record<string, { bg: string; fg: string; label: string }> = {
    ok: { bg: 'var(--dsw-alias-state-success-primary)', fg: '#fff', label: 'ok' },
    warn: { bg: 'var(--dsw-alias-state-warn-primary)', fg: '#fff', label: 'warn' },
    error: { bg: 'var(--dsw-alias-state-error-primary)', fg: '#fff', label: 'error' },
  }
  const c = (map[status] ?? map.ok)!
  return (
    <span
      style={{
        font: 'var(--dsw-font-xxs-12)',
        padding: '2px 8px',
        borderRadius: 999,
        background: c.bg,
        color: c.fg,
        fontWeight: 600,
        letterSpacing: '.02em',
        flex: 'none',
      }}
    >
      {c.label}
    </span>
  )
}

export function PluginCard(props: { plugin: PluginInfo; onCopy?: ((text: string, key: string) => void) | undefined; copiedKey?: (string | null) | undefined }) {
  const p = props.plugin
  const onCopy = props.onCopy
  const copiedKey = props.copiedKey ?? null
  return (
    <div
      data-plugin-card
      style={{
        border: '1px solid var(--dsw-alias-border-l2)',
        borderRadius: 16,
        background: 'var(--dsw-alias-bg-layer-1)',
        padding: 14,
        display: 'grid',
        gap: 10,
        minWidth: 0,
        transition: 'border-color 200ms, background 200ms',
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--dsw-alias-border-l3)')}
      onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = 'var(--dsw-alias-border-l2)')}
    >
      <style>{`
        @media (max-width: 640px) {
          [data-plugin-card] [data-card-actions] { flex-direction: column !important; align-items: stretch !important; }
          [data-plugin-card] [data-card-actions] button { width: 100% !important; justify-content: center !important; min-height: 32px !important; }
        }
      `}</style>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, minWidth: 0 }}>
        <div style={{ minWidth: 0, display: 'grid', gap: 4 }}>
          <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)', wordBreak: 'break-all' }}>{p.name}</div>
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', fontFamily: 'var(--ds-font-family-code)' }}>v{p.version}{p.latest && p.updateAvailable ? ` → ${p.latest}` : ''}</div>
        </div>
        <StatusPill status={p.status} />
      </div>
      {p.description && <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2 as any, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{p.description}</div>}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginTop: 2 }}>
        {p.updateAvailable && (
          <span
            style={{
              font: 'var(--dsw-font-xxs-12)',
              color: 'var(--dsw-alias-state-warn-primary)',
              background: 'var(--dsw-alias-bg-base)',
              border: '1px solid var(--dsw-alias-border-l1)',
              padding: '4px 8px',
              borderRadius: 999,
              fontWeight: 600,
            }}
          >
            Update available
          </span>
        )}
        <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginLeft: 'auto' }}>{p.id}</span>
      </div>
      {onCopy && (
        <div data-card-actions style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 6, borderTop: '1px solid var(--dsw-alias-border-l1)', marginTop: 2 }}>
          <button onClick={() => onCopy(`dsh plugin add ${p.name}`, `add-${p.id}`)} style={{ font: 'var(--dsw-font-xxs-12)', padding: '6px 10px', borderRadius: 999, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-base)', cursor: 'pointer', color: 'var(--dsw-alias-label-primary)', flex: 'none' }}>{copiedKey === `add-${p.id}` ? 'Copied' : 'Copy add'}</button>
          {p.updateAvailable && <button onClick={() => onCopy(`dsh plugin update ${p.name}@${p.latest ?? 'latest'}`, `upd-${p.id}`)} style={{ font: 'var(--dsw-font-xxs-12)', padding: '6px 10px', borderRadius: 999, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-state-warn-primary)', color: '#fff', cursor: 'pointer', flex: 'none' }}>{copiedKey === `upd-${p.id}` ? 'Copied' : `Update → ${p.latest}`}</button>}
        </div>
      )}
    </div>
  )
}

export function PluginGrid(props: { plugins: PluginInfo[]; onCopy?: ((text: string, key: string) => void) | undefined; copiedKey?: (string | null) | undefined }) {
  if (!props.plugins.length) {
    return <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)', padding: 16, border: '1px dashed var(--dsw-alias-border-l2)', borderRadius: 12, textAlign: 'center' as any }}>No plugins detected. Install with <code style={{ fontFamily: 'var(--ds-font-family-code)', background: 'var(--dsw-alias-bg-layer-2)', padding: '1px 6px', borderRadius: 6 }}>dsh plugin add @ddtcorex/dsh-maestro-*</code></div>
  }
  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }} data-plugin-grid>
      <style>{`@media (max-width: 640px) { [data-plugin-grid] { grid-template-columns: 1fr !important; } }`}</style>
      {props.plugins.map((pl) => (
        <PluginCard key={pl.name} plugin={pl} onCopy={props.onCopy} copiedKey={props.copiedKey} />
      ))}
    </div>
  )
}
