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
  const isRail = collapsed
  return (
    <button
      type="button"
      data-maestro-trigger=""
      onClick={props.onClick}
      style={{
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: isRail ? 0 : '8px',
        width: isRail ? '36px' : 'calc(100% + 4px)',
        height: isRail ? '36px' : '42px',
        margin: isRail ? '8px 0 10px' : '4px -2px',
        padding: isRail ? 0 : '0 10px 0 8px',
        boxSizing: 'border-box',
        border: 'none',
        borderRadius: isRail ? '50%' : '12px',
        background: 'transparent',
        cursor: 'pointer',
        overflow: 'hidden',
        color: 'var(--dsw-alias-label-primary)',
        fontFamily: 'inherit',
        fontSize: '14px',
        lineHeight: '22px',
        justifyContent: isRail ? 'center' : 'flex-start',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      aria-label="Maestro Dashboard"
    >
      <span style={{ display: 'inline-flex', width: 16, height: 16, color: 'var(--dsw-alias-label-primary)', flex: 'none', alignItems: 'center', justifyContent: 'center' }}>
        <MaestroLogo size={16} />
      </span>
      {!isRail && (
        <>
          <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', whiteSpace: 'nowrap' } as any}>Maestro</span>
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
