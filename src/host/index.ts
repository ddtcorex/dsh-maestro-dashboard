// dsh-maestro-dashboard — host wiring with loopback-hardened RPC
import { DASHBOARD_CHANNEL } from './shared/channels.ts'
import { dashboardMethodSchema } from './shared/types.ts'
import { getOverviewSnapshot } from './overview.ts'
import { getPluginsSnapshot } from './plugins.ts'
import { getUsageSnapshot } from './usage.ts'
import { getReviewsSnapshot } from './reviews.ts'
import { getSettingsDomains, setSetting } from './settings-bridge.ts'

function isLoopback(peer: any, headers: Record<string, string | undefined>): boolean {
  const addr = peer?.address ?? peer?.socketAddress ?? ''
  const host = (headers?.host ?? headers?.Host ?? '') as string
  const loopbackAddrs = ['127.0.0.1', '::1', '::ffff:127.0.0.1']
  const addrOk = loopbackAddrs.includes(addr) || /^127\.\d+\.\d+\.\d+$/.test(addr) || addr === '::1'
  let hostOk = false
  if (host) {
    const m = host.match(/^(127\.0\.0\.1|localhost|::1):\d+$/)
    hostOk = !!m
    if (host.includes('evil.com')) hostOk = false
  }
  if (addr) return addrOk && hostOk
  return hostOk
}

function toRpcResult<T>(value: T) { return { ok: true, value } as const }
function toRpcError(message: string, details?: unknown) {
  return { ok: false, error: { code: 'bad-request', message, details } } as const
}

export function createHandler(cordisCtx?: any) {
  return async (payload: any, ctx: { peer?: any; headers?: Record<string, string>; origin?: string; contentType?: string } = {}) => {
    let actualPayload = payload
    let actualCtx = ctx
    if (typeof payload === 'string' && ctx && typeof ctx === 'object' && 'op' in (ctx as any)) {
      actualPayload = ctx
      actualCtx = {}
    }
    const peer = actualCtx?.peer ?? { address: '127.0.0.1' }
    const headers = actualCtx?.headers ?? { host: '127.0.0.1:3080' }
    const bodyStr = JSON.stringify(actualPayload ?? {})
    if (bodyStr.length > 64 * 1024) {
      return toRpcError('body too large')
    }
    if (actualCtx?.peer || actualCtx?.headers) {
      if (!isLoopback(peer, headers)) {
        return toRpcError('loopback required')
      }
      const mForCheck = actualPayload as any
      if (mForCheck?.op === 'setSetting') {
        const origin = actualCtx?.origin ?? headers?.origin
        if (origin && !/^(https?:\/\/(127\.0\.0\.1|localhost|::1)(:\d+)?)$/.test(origin)) {
          return toRpcError('loopback origin required')
        }
        const ct = actualCtx?.contentType ?? headers?.['content-type'] ?? headers?.['Content-Type']
        if (ct && ct !== 'application/json') {
          return toRpcError('content-type must be application/json')
        }
      }
    }
    const parsed = dashboardMethodSchema.safeParse(actualPayload)
    if (!parsed.success) {
      return toRpcError('unknown-op', parsed.error.issues)
    }
    const m = parsed.data as any
    try {
      if (m.op === 'getOverview') return toRpcResult(await getOverviewSnapshot(cordisCtx ?? { get: () => undefined }))
      if (m.op === 'getPlugins') return toRpcResult(await getPluginsSnapshot())
      if (m.op === 'getUsage') return toRpcResult(await getUsageSnapshot(m.range))
      if (m.op === 'getReviews') return toRpcResult(await getReviewsSnapshot((m as any).limit))
      if (m.op === 'getSettingsDomains') return toRpcResult(await getSettingsDomains())
      if (m.op === 'setSetting') { await setSetting(m.domain, m.patch); return toRpcResult({ ok: true }) }
    } catch (e: any) {
      return toRpcError(String(e?.message ?? e))
    }
    return toRpcError('unknown-op')
  }
}

export default {
  inject: ['connection'] as const,
  apply(ctx: any) {
    const handler = createHandler(ctx)
    ctx.effect(() => {
      if (ctx.connection?.rpc?.handle) {
        return ctx.connection.rpc.handle(
          DASHBOARD_CHANNEL,
          async (endpoint: string, payload: unknown) => handler(payload, {}),
          { authority: 'loopback' },
        )
      }
      return () => {}
    })
  },
}
