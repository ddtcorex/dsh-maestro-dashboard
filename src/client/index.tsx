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
  }, [ctx, usageRange])

  // Lazy queries: only fetch after user clicks Maestro button (overlay open) — avoids background load on every DSH boot
  React.useEffect(() => {
    if (!open) return
    fetchAll(usageRange)
    const timer = setInterval(() => fetchAll(usageRange), 30000)
    return () => clearInterval(timer)
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
        /* Width align: Maestro 256 vs Settings 260 vs Cordis badge 260 — both used calc(100%+4px) with -2px margin, overflowing footArea (256). Normalize to 100% */
        [class*="_footArea"] [data-maestro-trigger] { width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }
        [class*="_footArea"] [class*="zWKi1a_trigger"] { width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; margin-left: 0 !important; margin-right: 0 !important; }
        [class*="_footArea"] [class*="FNBb8a_badge"] { width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; margin-left: 0 !important; margin-right: 0 !important; left: auto !important; right: auto !important; display: flex !important; align-items: center !important; gap: 8px !important; height: 36px !important; padding: 0 10px 0 8px !important; border-radius: 8px !important; }
        [class*="_footArea"] [class*="FNBb8a_layer"], [class*="_footArea"] [class*="FNBb8a_footerButtons"] { width: 100% !important; max-width: 100% !important; box-sizing: border-box !important; }
        /* Cordis badge logo/title: match Maestro BrandBadge — blue tile, white icon, label flex */
        [class*="_footArea"] [class*="FNBb8a_badge"] svg { width: 18px !important; height: 18px !important; min-width: 18px !important; min-height: 18px !important; padding: 1px !important; border-radius: 4px !important; background: #0A84FF !important; color: #fff !important; border: 1px solid rgba(0,0,0,0.08) !important; box-sizing: border-box !important; flex: none !important; display: block !important; }
        [class*="_footArea"] [class*="FNBb8a_badgeLabel"] { flex: 1 1 auto !important; text-align: left !important; overflow: hidden !important; white-space: nowrap !important; font-size: 14px !important; line-height: 22px !important; color: var(--dsw-alias-label-primary) !important; display: block !important; visibility: visible !important; opacity: 1 !important; }
        [class*="_footArea"] [class*="FNBb8a_badgeCount"] { flex: none !important; font-size: 12px !important; line-height: 16px !important; color: var(--dsw-alias-label-secondary) !important; background: var(--dsw-alias-bg-layer-2, #EBEEF2) !important; border-radius: 999px !important; padding: 2px 6px !important; display: inline-flex !important; visibility: visible !important; opacity: 1 !important; }
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
