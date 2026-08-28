import * as React from 'react'
import { MaestroTrigger } from './trigger.tsx'
import { Overlay } from './overlay.tsx'

const DASHBOARD_CHANNEL = '/dsh-maestro-dashboard' as const

function DashboardApp({ ctx, wide }: { ctx: any; wide?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const [health, setHealth] = React.useState<'ok' | 'warn' | 'error'>('ok')
  const [overview, setOverview] = React.useState<any>(null)
  const [plugins, setPlugins] = React.useState<any>(null)
  const [usage, setUsage] = React.useState<any>(null)
  const [reviews, setReviews] = React.useState<any>(null)
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
      const [o, p, u, r] = await Promise.all([doCall({ op: 'getOverview' }), doCall({ op: 'getPlugins' }), doCall({ op: 'getUsage', range }), doCall({ op: 'getReviews', limit: 20 })])
      if (o) {
        setOverview(o)
        const healthList = (o?.data?.health ?? o?.health ?? []) as any[]
        const hasWarn = Array.isArray(healthList) && healthList.some((h: any) => h.status !== 'ok')
        setHealth(hasWarn ? 'warn' : 'ok')
      }
      if (p) setPlugins(p)
      if (u) setUsage(u)
      if (r) setReviews(r)
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
      {open && <Overlay onClose={() => setOpen(false)} overview={overview} plugins={plugins} usage={usage} reviews={reviews} usageRange={usageRange} onUsageRangeChange={(r) => { setUsageRange(r); fetchAll(r) }} />}
    </>
  )
}

export default {
  inject: ['slots', 'connection'] as const,
  apply(ctx: any) {
    ctx.effect(() =>
      ctx.slots.inject('sidebar.footer.action', () =>
        ctx.slots.register(
          {
            name: 'sidebar.footer.action',
            id: 'maestro-dashboard-trigger',
            order: 10,
          },
          (props: any) => React.createElement(DashboardApp, { ctx, wide: props.wide }),
        ),
      ),
    )
  },
}
