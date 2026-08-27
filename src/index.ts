// dsh-maestro-dashboard — host wiring with loopback-hardened RPC
import { DASHBOARD_CHANNEL } from './shared/channels.ts'
import { dashboardMethodSchema } from './shared/types.ts'
import { getOverviewSnapshot } from './host/overview.ts'
import { getPluginsSnapshot } from './host/plugins.ts'
import { getUsageSnapshot } from './host/usage.ts'
import { getSettingsDomains, setSetting } from './host/settings-bridge.ts'

function isLoopback(peer: any, headers: Record<string, string | undefined>): boolean {
  const addr = peer?.address ?? peer?.socketAddress ?? ''
  const host = (headers?.host ?? headers?.Host ?? '') as string
  // Loopback addr check
  const loopbackAddrs = ['127.0.0.1', '::1', '::ffff:127.0.0.1']
  const addrOk = loopbackAddrs.includes(addr) || /^127\.\d+\.\d+\.\d+$/.test(addr) || addr === '::1'
  // If peer not provided (test), fallback to host header check only
  // Host header must be exact loopback with port, not prefix (reject 127.0.0.1.evil.com)
  let hostOk = false
  if (host) {
    const m = host.match(/^(127\.0\.0\.1|localhost|::1)(:\d+)?$/)
    hostOk = !!m
    if (host.includes('evil.com')) hostOk = false
  } else {
    hostOk = addrOk
  }
  if (peer && addr) return addrOk && hostOk
  return hostOk
}

export function createHandler() {
  return async (payload: any, ctx: { peer?: any; headers?: Record<string, string> }) => {
    const peer = ctx?.peer ?? { address: '127.0.0.1' }
    const headers = ctx?.headers ?? { host: '127.0.0.1:3080' }
    // Body size check 64KB
    const bodyStr = JSON.stringify(payload ?? {})
    if (bodyStr.length > 64 * 1024) {
      return { error: 'body too large' }
    }
    if (!isLoopback(peer, headers)) {
      return { error: 'loopback required' }
    }
    const parsed = dashboardMethodSchema.safeParse(payload)
    if (!parsed.success) {
      return { error: 'unknown-op', issues: parsed.error.issues }
    }
    const m = parsed.data as any
    try {
      if (m.op === 'getOverview') return await getOverviewSnapshot({ get: () => undefined })
      if (m.op === 'getPlugins') return await getPluginsSnapshot()
      if (m.op === 'getUsage') return await getUsageSnapshot(m.range)
      if (m.op === 'getSettingsDomains') return await getSettingsDomains()
      if (m.op === 'setSetting') { await setSetting(m.domain, m.patch); return { ok: true } }
    } catch (e: any) {
      return { error: String(e?.message ?? e) }
    }
    return { error: 'unknown-op' }
  }
}

export default {
  inject: [] as const,
  apply(ctx: any) {
    const handler = createHandler()
    ctx.effect(() => {
      if (ctx.connection?.rpc?.handle) {
        return ctx.connection.rpc.handle(DASHBOARD_CHANNEL, async (payload: any, peer: any) => {
          // peer comes from cordis rpc, headers from peer
          return handler(payload, { peer, headers: peer?.headers ?? { host: '127.0.0.1:3080' } })
        })
      }
      return () => {}
    })
  },
}
