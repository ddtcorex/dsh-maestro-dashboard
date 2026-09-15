import * as React from 'react'
import { MaestroTrigger } from './trigger.tsx'
import { Overlay } from './overlay.tsx'

const DASHBOARD_CHANNEL = '/dsh-maestro-dashboard' as const
const OBSERVE_CHANNEL = '/dsh-maestro-observe' as const

function DashboardApp({ ctx, wide }: { ctx: any; wide?: boolean }) {
  const [open, setOpen] = React.useState(false)
  const [health, setHealth] = React.useState<'ok' | 'warn' | 'error'>('ok')
  const [overview, setOverview] = React.useState<any>(null)
  const [plugins, setPlugins] = React.useState<any>(null)
  const [usage, setUsage] = React.useState<any>(null)
  const [reviews, setReviews] = React.useState<any>(null)
  const [usageRange, setUsageRange] = React.useState<'7d' | '30d'>('7d')
  const [activity, setActivity] = React.useState<any>(null)

  const doCallOn = React.useCallback(async (channel: string, endpoint: string, payload: any) => {
    const conn = (ctx as any)?.connection ?? (ctx as any)?.get?.('connection')
    if (conn?.rpc?.call) {
      try {
        const r: any = await conn.rpc.call(channel, '', payload)
        return r?.ok ? r.value : r
      } catch {
        try {
          const r2: any = await conn.rpc.call(channel, endpoint, payload)
          return r2?.ok ? r2.value : r2
        } catch {}
      }
    }
    const host = (window as any).__dshHost ?? (globalThis as any).host
    if (host?.call) {
      const r: any = await host.call(channel, '', payload)
      return r?.ok ? r.value : r
    }
    return null
  }, [ctx])

  const fetchAll = React.useCallback(async (range: '7d' | '30d' = usageRange) => {
    const doCall = (payload: any) => doCallOn(DASHBOARD_CHANNEL, payload.op, payload)
    try {
      const [o, pl, u, r] = await Promise.all([doCall({ op: 'getOverview' }), doCall({ op: 'getPlugins' }), doCall({ op: 'getUsage', range }), doCall({ op: 'getReviews', limit: 20 })])
      if (o) {
        setOverview(o)
        const healthList = (o?.data?.health ?? o?.health ?? []) as any[]
        const hasWarn = Array.isArray(healthList) && healthList.some((h: any) => h.status !== 'ok')
        setHealth(hasWarn ? 'warn' : 'ok')
      }
      if (pl) setPlugins(pl)
      if (u) setUsage(u)
      if (r) setReviews(r)
    } catch {}
  }, [doCallOn, usageRange])

  // Observe-backed activity (optional): hidden when the observe channel is absent.
  // NOTE: token usage is captured on step records (tool=null), so per-tool tokens are
  // structurally zero today — tools are counted from recent trace records instead.
  const fetchActivity = React.useCallback(async () => {
    try {
      const [t, e, l] = await Promise.all([
        doCallOn(OBSERVE_CHANNEL, 'trace', { limit: 500, kind: 'tool' }),
        doCallOn(OBSERVE_CHANNEL, 'errors', {}),
        doCallOn(OBSERVE_CHANNEL, 'latency', {}),
      ])
      if (!t?.records || !e?.groups || !l?.latency) {
        setActivity(null)
        return
      }
      const counts = new Map<string, number>()
      for (const r of t.records as Array<{ tool?: string }>) {
        const k = r.tool ?? ''
        counts.set(k, (counts.get(k) ?? 0) + 1)
      }
      setActivity({
        tools: [...counts.entries()].map(([tool, calls]) => ({ tool, calls })),
        errors: e.groups,
        latency: l.latency,
      })
    } catch {
      setActivity(null)
    }
  }, [doCallOn])

  // Lazy queries: only fetch after user clicks Maestro button (overlay open) — avoids background load on every DSH boot
  React.useEffect(() => {
    if (!open) return
    fetchAll(usageRange)
    fetchActivity()
    const timer = setInterval(() => { fetchAll(usageRange); fetchActivity() }, 30000)
    return () => clearInterval(timer)
  }, [open, fetchAll, fetchActivity, usageRange])

  return (
    <>
      <MaestroTrigger health={health} wide={wide ?? true} onClick={() => setOpen(true)} />
      {open && <Overlay onClose={() => setOpen(false)} overview={overview} plugins={plugins} usage={usage} reviews={reviews} activity={activity} usageRange={usageRange} onUsageRangeChange={(r) => { setUsageRange(r); fetchAll(r) }} />}
    </>
  )
}

export default {
  inject: ['slots', 'connection'] as const,
  apply(ctx: any) {
    // Fix footerActions horizontal layout: Cordis + Maestro were side-by-side (flex row)
    // Force column so each action stacks vertically above Settings. Scoped to the
    // sidebar foot area (_footArea → _footerActions): an unscoped [class*="_footerActions"]
    // also matched DSH's question-composer footerActions and stacked its Skip/Next buttons.
    ctx.effect(() => {
      const style = document.createElement('style')
      style.setAttribute('data-maestro-footer-fix', '')
      style.textContent = `
        [class*="_footArea"] [class*="_footerActions"] { flex-direction: column !important; align-items: stretch !important; gap: 2px !important; }
        [class*="_footArea"] [class*="_footerActions"] [data-slot="sidebar.footer.action"] { display: flex !important; flex-direction: column !important; gap: 2px !important; width: 100% !important; }
        /* Maestro 260px like Settings (calc 100%+4px with -2px margin) — keep Cordis/Settings untouched */
        [class*="_footArea"] [data-maestro-trigger] { width: calc(100% + 4px) !important; max-width: none !important; margin-left: -2px !important; margin-right: -2px !important; box-sizing: border-box !important; }
        @media (max-width: 1023px) {
          [data-maestro-trigger] {
            border: 1px solid var(--dsw-alias-border-l2, rgba(0, 0, 0, .14)) !important;
            background: var(--dsw-alias-button-elevated-fill, #ffffff) !important;
          }
        }
      `
      document.head.appendChild(style)
      return () => style.remove()
    }, 'maestro footer column fix')
    ctx.effect(() =>
      ctx.slots.inject('sidebar.footer.action', () =>
        ctx.slots.register(
          {
            name: 'sidebar.footer.action',
            id: 'maestro-dashboard-trigger',
            order: 20,
          },
          (props: any) => React.createElement(DashboardApp, { ctx, wide: props.wide }),
        ),
      ),
    )
  },
}
