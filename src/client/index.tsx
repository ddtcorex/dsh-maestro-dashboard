import * as React from 'react'
import { MaestroTrigger } from './trigger.tsx'
import { Overlay } from './overlay.tsx'

function DashboardApp() {
  const [open, setOpen] = React.useState(false)
  const [health, setHealth] = React.useState<'ok' | 'warn' | 'error'>('ok')

  React.useEffect(() => {
    // Poll host for health (stale-while-revalidate 30s)
    let timer: any
    const poll = async () => {
      try {
        // @ts-ignore — host global
        const host = (window as any).__dshHost ?? (globalThis as any).host
        if (host?.call) {
          const snap: any = await host.call('/maestro-dashboard', { op: 'getOverview' })
          const hasWarn = snap?.data?.health?.some((h: any) => h.status !== 'ok')
          setHealth(hasWarn ? 'warn' : 'ok')
        }
      } catch {}
    }
    poll()
    timer = setInterval(poll, 30000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <MaestroTrigger health={health} onClick={() => setOpen(true)} />
      {open && <Overlay onClose={() => setOpen(false)} />}
    </>
  )
}

export default {
  inject: ['slots'] as const,
  apply(ctx: any) {
    ctx.effect(() => {
      if (ctx.slots?.inject) {
        // Primary: above Settings, fallback to sidebar
        const dispose1 = ctx.slots.inject('sidebar:settingsArea:before', () => React.createElement(DashboardApp))
        if (dispose1) return dispose1
        try {
          return ctx.slots.inject('sidebar', () => React.createElement(DashboardApp))
        } catch {
          return () => {}
        }
      }
      return () => {}
    })
  },
}
