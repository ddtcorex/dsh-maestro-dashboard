import * as React from 'react'
import { MaestroTrigger } from './trigger.tsx'
import { Overlay } from './overlay.tsx'

const DASHBOARD_CHANNEL = '/maestro-dashboard' as const

function DashboardApp({ ctx, wide }: { ctx: any; wide?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const [health, setHealth] = React.useState<'ok' | 'warn' | 'error'>('ok')

  React.useEffect(() => {
    let timer: any
    const poll = async () => {
      try {
        const conn = ctx?.connection ?? ctx?.get?.('connection')
        let snap: any = null
        let res: any = null
        if (conn?.rpc?.call) {
          try {
            res = await conn.rpc.call(DASHBOARD_CHANNEL, '', { op: 'getOverview' })
          } catch {
            try {
              res = await conn.rpc.call(DASHBOARD_CHANNEL, 'getOverview', { op: 'getOverview' })
            } catch {}
          }
          snap = res?.ok ? res.value : res
          if (snap) {
            const healthList = (snap?.data?.health ?? snap?.health ?? []) as any[]
            const hasWarn = Array.isArray(healthList) && healthList.some((h: any) => h.status !== 'ok')
            setHealth(hasWarn ? 'warn' : 'ok')
            return
          }
        }
        // fallback: try legacy host global (for tests)
        const host = (window as any).__dshHost ?? (globalThis as any).host
        if (host?.call) {
          const s2: any = await host.call(DASHBOARD_CHANNEL, '', { op: 'getOverview' })
          const v2 = s2?.ok ? s2.value : s2
          const hasWarn = v2?.data?.health?.some((h: any) => h.status !== 'ok')
          setHealth(hasWarn ? 'warn' : 'ok')
        }
      } catch {}
    }
    poll()
    timer = setInterval(poll, 30000)
    return () => clearInterval(timer)
  }, [ctx])

  return (
    <>
      <MaestroTrigger health={health} wide={wide ?? true} onClick={() => setOpen(true)} />
      {open && <Overlay onClose={() => setOpen(false)} />}
    </>
  )
}

export default {
  inject: ['slots', 'connection'] as const,
  apply(ctx: any) {
    // Correct list-slot registration: sidebar.footer.action expects register, not direct factory
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
    // Fullscreen overlay via shell.overlay (frame-wide, above columns)
    ctx.effect(() => {
      // This effect is managed inside DashboardApp's open state; we keep a no-op here to satisfy inject ordering
      return () => {}
    })
  },
}
