import * as React from 'react'
import { BrandBadge, MaestroMark } from './components/BrandMark.tsx'

// Re-export for tests / shared logo — both sidebar and popup use BrandBadge now
export const MaestroLogo = MaestroMark

export type HealthStatus = 'ok' | 'warn' | 'error'

const dotColor: Record<HealthStatus, string> = {
  ok: 'var(--dsw-alias-state-success-primary)',
  warn: 'var(--dsw-alias-state-warn-primary)',
  error: 'var(--dsw-alias-state-error-primary)',
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
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        gap: isRail ? 0 : '8px',
        width: isRail ? '36px' : 'calc(100% + 4px)',
        maxWidth: 'none',
        height: isRail ? '36px' : '36px',
        margin: isRail ? '8px auto' : '6px -2px 4px',
        padding: isRail ? 0 : '0 10px 0 8px',
        boxSizing: 'border-box',
        border: '1px solid transparent',
        borderRadius: isRail ? '50%' : '8px',
        background: 'transparent',
        cursor: 'pointer',
        overflow: 'hidden',
        color: 'var(--dsw-alias-label-primary)',
        fontFamily: 'inherit',
        fontSize: '14px',
        lineHeight: '22px',
        justifyContent: isRail ? 'center' : 'flex-start',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--dsw-alias-interactive-bg-hover)'
        e.currentTarget.style.borderColor = 'var(--dsw-alias-border-l1)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
        e.currentTarget.style.borderColor = 'transparent'
      }}
      aria-label="Maestro Dashboard"
    >
      <BrandBadge outer={isRail ? 20 : 18} size={isRail ? 18 : 16} radius={isRail ? 6 : 4} />
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
