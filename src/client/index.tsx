import * as React from 'react'
import { MaestroTrigger, MaestroLogo } from './trigger.tsx'
import { Overlay } from './overlay.tsx'

const DASHBOARD_CHANNEL = '/maestro-dashboard' as const

function DashboardApp({ ctx, wide }: { ctx: any; wide?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const [health, setHealth] = React.useState<'ok' | 'warn' | 'error'>('ok')
  const [overview, setOverview] = React.useState<any>(null)
  const [plugins, setPlugins] = React.useState<any>(null)
  const [usage, setUsage] = React.useState<any>(null)
  const [usageRange, setUsageRange] = React.useState<'7d' | '30d'>('7d')

  const fetchAll = React.useCallback(async (range: '7d' | '30d' = usageRange) => {
    const conn = (ctx as any)?.connection ?? (ctx as any)?.get?.('connection')
    const doCall = async (payload: any) => {
      if (conn?.rpc?.call) {
        try {
          const r: any = await conn.rpc.call(DASHBOARD_CHANNEL, '', payload)
          return r?.ok ? r.value : r
        } catch {
          try {
            const r2: any = await conn.rpc.call(DASHBOARD_CHANNEL, payload.op, payload)
            return r2?.ok ? r2.value : r2
          } catch {}
        }
      }
      const host = (window as any).__dshHost ?? (globalThis as any).host
      if (host?.call) {
        const r: any = await host.call(DASHBOARD_CHANNEL, '', payload)
        return r?.ok ? r.value : r
      }
      return null
    }
    try {
      const [o, p, u] = await Promise.all([doCall({ op: 'getOverview' }), doCall({ op: 'getPlugins' }), doCall({ op: 'getUsage', range })])
      if (o) {
        setOverview(o)
        const healthList = (o?.data?.health ?? o?.health ?? []) as any[]
        const hasWarn = Array.isArray(healthList) && healthList.some((h: any) => h.status !== 'ok')
        setHealth(hasWarn ? 'warn' : 'ok')
      }
      if (p) setPlugins(p)
      if (u) setUsage(u)
    } catch {}
  }, [ctx, usageRange])

  React.useEffect(() => {
    fetchAll(usageRange)
    const timer = setInterval(() => fetchAll(usageRange), 30000)
    return () => clearInterval(timer)
  }, [fetchAll, usageRange])

  React.useEffect(() => {
    if (open) fetchAll(usageRange)
  }, [open, fetchAll, usageRange])

  return (
    <>
      <MaestroTrigger health={health} wide={wide ?? true} onClick={() => setOpen(true)} />
      {open && <Overlay onClose={() => setOpen(false)} overview={overview} plugins={plugins} usage={usage} usageRange={usageRange} onUsageRangeChange={(r) => { setUsageRange(r); fetchAll(r) }} />}
    </>
  )
}

const dotColor: Record<'ok' | 'warn' | 'error', string> = {
  ok: 'var(--dsw-alias-state-success-primary)',
  warn: 'var(--dsw-alias-state-warn-primary)',
  error: 'var(--dsw-alias-state-error-primary)',
}

function MobileDashboardFab({ ctx }: { ctx: any }) {
  const [open, setOpen] = React.useState(false)
  const [health, setHealth] = React.useState<'ok' | 'warn' | 'error'>('ok')
  const [overview, setOverview] = React.useState<any>(null)
  const [plugins, setPlugins] = React.useState<any>(null)
  const [usage, setUsage] = React.useState<any>(null)
  const [usageRange, setUsageRange] = React.useState<'7d' | '30d'>('7d')

  const fetchAll = React.useCallback(async (range: '7d' | '30d' = usageRange) => {
    const conn = (ctx as any)?.connection ?? (ctx as any)?.get?.('connection')
    const doCall = async (payload: any) => {
      if (conn?.rpc?.call) {
        try {
          const r: any = await conn.rpc.call(DASHBOARD_CHANNEL, '', payload)
          return r?.ok ? r.value : r
        } catch {
          try {
            const r2: any = await conn.rpc.call(DASHBOARD_CHANNEL, payload.op, payload)
            return r2?.ok ? r2.value : r2
          } catch {}
        }
      }
      const host = (window as any).__dshHost ?? (globalThis as any).host
      if (host?.call) {
        const r: any = await host.call(DASHBOARD_CHANNEL, '', payload)
        return r?.ok ? r.value : r
      }
      return null
    }
    try {
      const [o, p, u] = await Promise.all([doCall({ op: 'getOverview' }), doCall({ op: 'getPlugins' }), doCall({ op: 'getUsage', range })])
      if (o) {
        setOverview(o)
        const healthList = (o?.data?.health ?? o?.health ?? []) as any[]
        const hasWarn = Array.isArray(healthList) && healthList.some((h: any) => h.status !== 'ok')
        setHealth(hasWarn ? 'warn' : 'ok')
      }
      if (p) setPlugins(p)
      if (u) setUsage(u)
    } catch {}
  }, [ctx, usageRange])

  React.useEffect(() => {
    fetchAll(usageRange)
    const timer = setInterval(() => fetchAll(usageRange), 30000)
    return () => clearInterval(timer)
  }, [fetchAll, usageRange])

  React.useEffect(() => {
    if (open) fetchAll(usageRange)
  }, [open, fetchAll, usageRange])

  return (
    <>
      <div
        data-maestro-mobile-fab=""
        style={{
          position: 'absolute',
          bottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          right: '16px',
          zIndex: 5,
          pointerEvents: 'auto',
        }}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Maestro Dashboard"
          title="Maestro Dashboard"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            border: '1px solid var(--dsw-alias-border-l2-darkmode-thin)',
            background: 'var(--dsw-alias-button-floating-fill)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--dsw-alias-label-primary)',
            position: 'relative',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--dsw-alias-button-floating-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--dsw-alias-button-floating-fill)')}
        >
          <span style={{ display: 'inline-flex', width: 18, height: 18, color: 'var(--dsw-alias-label-primary)' }}>
            <MaestroLogo size={18} />
          </span>
          <span
            data-testid="health-dot"
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: dotColor[health],
              border: '1px solid var(--dsw-alias-bg-layer-1, #fff)',
              flex: 'none',
            }}
          />
        </button>
      </div>
      {open && <Overlay onClose={() => setOpen(false)} overview={overview} plugins={plugins} usage={usage} usageRange={usageRange} onUsageRangeChange={(r) => { setUsageRange(r); fetchAll(r) }} />}
    </>
  )
}

export default {
  inject: ['slots', 'connection'] as const,
  apply(ctx: any) {
    // Desktop / drawer: sidebar.footer.action is offscreen when drawer is hidden on mobile
    ctx.effect(() =>
      ctx.slots.inject('sidebar.footer.action', () =>
        ctx.slots.register(
          {
            name: 'sidebar.footer.action',
            id: 'maestro-dashboard-trigger',
            order: -1,
          },
          (props: any) => React.createElement(DashboardApp, { ctx, wide: props.wide }),
        ),
      ),
    )
    // Mobile: shell.overlay is root-scoped and visible even when the sidebar drawer is collapsed
    ctx.effect(() =>
      ctx.slots.inject('shell.overlay', () =>
        ctx.slots.register(
          {
            name: 'shell.overlay',
            id: 'maestro-dashboard-mobile',
            order: 10,
          },
          () => React.createElement(MobileDashboardFab, { ctx }),
        ),
      ),
    )
    // Visibility + DSH native floating style — FAB only on narrow viewports (mirrors dsh-maestro-mobile breakpoint 1023px)
    ctx.effect(() => {
      const tag = document.createElement('style')
      tag.dataset.plugin = '@ddtcorex/dsh-maestro-dashboard'
      tag.dataset.part = 'maestro-mobile-fab'
      tag.textContent = `
@media (min-width: 1024px) {
  [data-maestro-mobile-fab] { display: none !important; }
}
@media (max-width: 1023px) {
  [data-maestro-mobile-fab] { display: block !important; }
}
`
      document.head.appendChild(tag)
      return () => tag.remove()
    }, 'dsh-maestro-dashboard: mobile fab visibility')
  },
}
