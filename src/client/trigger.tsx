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
