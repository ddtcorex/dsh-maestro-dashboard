import * as React from 'react'

export type HealthStatus = 'ok' | 'warn' | 'error'

const dotColor: Record<HealthStatus, string> = {
  ok: 'var(--dsw-alias-state-success-primary)',
  warn: 'var(--dsw-alias-state-warn-primary)',
  error: 'var(--dsw-alias-state-error-primary)',
}

// Maestro M-logo: geometric, currentColor, no external asset
export function MaestroLogo(props: { size?: number }) {
  const s = props.size ?? 16
  return (
    <svg width={s} height={s} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2 11 L5 4 L8 9 L11 4 L14 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function MaestroTrigger(props: { health?: HealthStatus; collapsed?: boolean; wide?: boolean; onClick?: () => void }) {
  const health = props.health ?? 'ok'
  const collapsed = props.collapsed ?? (props.wide === false)
  // Match Settings trigger exactly (SettingsRoot.module.css:.trigger / .trigger.rail)
  if (collapsed) {
    return (
      <button
        data-maestro-trigger
        onClick={props.onClick}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0,
          width: 36,
          height: 36,
          margin: '8px 0 10px',
          padding: 0,
          boxSizing: 'border-box',
          border: 'none',
          borderRadius: '50%',
          background: 'transparent',
          cursor: 'pointer',
          color: 'var(--dsw-alias-label-primary)',
          flex: 'none',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        aria-label="Maestro Dashboard"
        title="Maestro Dashboard"
      >
        <span style={{ display: 'inline-flex', width: 18, height: 18, color: 'var(--dsw-alias-label-primary)' }}>
          <MaestroLogo size={18} />
        </span>
      </button>
    )
  }
  return (
    <button
      data-maestro-trigger
      onClick={props.onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        width: 'calc(100% + 4px)',
        height: 42,
        margin: '4px -2px',
        padding: '0 10px 0 8px',
        boxSizing: 'border-box',
        border: 'none',
        borderRadius: 12,
        background: 'transparent',
        cursor: 'pointer',
        overflow: 'hidden',
        color: 'var(--dsw-alias-label-primary)',
        fontFamily: 'inherit',
        fontSize: 14,
        lineHeight: '22px',
        flex: 'none',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      aria-label="Maestro Dashboard"
    >
      <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--dsw-alias-label-primary)', flex: 'none' }}>
        <MaestroLogo size={16} />
      </span>
      <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', whiteSpace: 'nowrap', textAlign: 'left' }}>Maestro</span>
      <span
        data-testid="health-dot"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: dotColor[health],
          flex: 'none',
        }}
      />
    </button>
  )
}
