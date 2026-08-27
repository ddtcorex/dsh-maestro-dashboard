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

export function MaestroTrigger(props: { health?: HealthStatus; collapsed?: boolean; onClick?: () => void }) {
  const health = props.health ?? 'ok'
  const collapsed = props.collapsed ?? false
  return (
    <button
      onClick={props.onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        height: '32px',
        padding: '0 8px',
        borderRadius: '8px',
        border: 'none',
        background: 'transparent',
        color: 'var(--dsw-alias-label-primary)',
        cursor: 'pointer',
        width: '100%',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      aria-label="Maestro Dashboard"
    >
      <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--dsw-alias-label-primary)' }}>
        <MaestroLogo />
      </span>
      {!collapsed && (
        <>
          <span style={{ fontSize: '14px', lineHeight: '22px', fontWeight: 500, flex: 1, textAlign: 'left' }}>Maestro</span>
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
        </>
      )}
    </button>
  )
}
