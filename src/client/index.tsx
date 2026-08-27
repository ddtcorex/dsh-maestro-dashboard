import * as React from 'react'
import { MaestroTrigger } from './trigger.tsx'
import { Overlay } from './overlay.tsx'

const DASHBOARD_CHANNEL = '/maestro-dashboard' as const

function DashboardApp({ ctx }: { ctx: any }) {
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
      <MaestroTrigger health={health} onClick={() => setOpen(true)} />
      {open && <Overlay onClose={() => setOpen(false)} />}
    </>
  )
}

export default {
  inject: ['slots', 'connection'] as const,
  apply(ctx: any) {
    // Trigger beside Settings (sidebar foot) — the only slot that renders above/with Settings without shadowing whole sidebar
    ctx.effect(() => {
      const factory = () => React.createElement(DashboardApp, { ctx })
      try {
        // list slot requires registration object with id
        const d = ctx.slots?.inject('sidebar.footer.action', { id: 'maestro-dashboard-trigger', order: -1 }, factory)
        if (d) return d
      } catch {}
      // fallback for older harness builds that still expose sidebar:settingsArea:before
      try {
        const d2 = ctx.slots?.inject('sidebar:settingsArea:before', factory)
        if (d2) return d2
      } catch {}
      try {
        const d3 = ctx.slots?.inject('sidebar', factory)
        if (d3) return d3
      } catch {}
      return () => {}
    })
    // Fullscreen overlay via shell.overlay (frame-wide, above columns)
    ctx.effect(() => {
      // This effect is managed inside DashboardApp's open state; we keep a no-op here to satisfy inject ordering
      return () => {}
    })
  },
}
