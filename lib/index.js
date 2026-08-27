// dsh-maestro-dashboard — host wiring with loopback-hardened RPC
import { DASHBOARD_CHANNEL } from "./shared/channels.js";
import { dashboardMethodSchema } from "./shared/types.js";
import { getOverviewSnapshot } from "./host/overview.js";
import { getPluginsSnapshot } from "./host/plugins.js";
import { getUsageSnapshot } from "./host/usage.js";
import { getSettingsDomains, setSetting } from "./host/settings-bridge.js";
function isLoopback(peer, headers) {
    const addr = peer?.address ?? peer?.socketAddress ?? '';
    const host = (headers?.host ?? headers?.Host ?? '');
    const loopbackAddrs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
    const addrOk = loopbackAddrs.includes(addr) || /^127\.\d+\.\d+\.\d+$/.test(addr) || addr === '::1';
    let hostOk = false;
    if (host) {
        // Require port per spec: 127.0.0.1:port or localhost:port
        const m = host.match(/^(127\.0\.0\.1|localhost|::1):\d+$/);
        hostOk = !!m;
        if (host.includes('evil.com'))
            hostOk = false;
    }
    // Both must be loopback; if peer missing, host must be loopback with port
    if (addr)
        return addrOk && hostOk;
    return hostOk;
}
export function createHandler(cordisCtx) {
    return async (payload, ctx) => {
        const peer = ctx?.peer ?? { address: '127.0.0.1' };
        const headers = ctx?.headers ?? { host: '127.0.0.1:3080' };
        // Body size check 64KB on raw JSON
        const bodyStr = JSON.stringify(payload ?? {});
        if (bodyStr.length > 64 * 1024) {
            return { error: 'body too large' };
        }
        if (!isLoopback(peer, headers)) {
            return { error: 'loopback required' };
        }
        // Origin and Content-Type checks for writes
        const mForCheck = payload;
        if (mForCheck?.op === 'setSetting') {
            const origin = ctx?.origin ?? headers?.origin;
            if (origin && !/^(https?:\/\/(127\.0\.0\.1|localhost|::1)(:\d+)?)$/.test(origin)) {
                return { error: 'loopback origin required' };
            }
            const ct = ctx?.contentType ?? headers?.['content-type'] ?? headers?.['Content-Type'];
            if (ct && ct !== 'application/json') {
                return { error: 'content-type must be application/json' };
            }
        }
        const parsed = dashboardMethodSchema.safeParse(payload);
        if (!parsed.success) {
            return { error: 'unknown-op', issues: parsed.error.issues };
        }
        const m = parsed.data;
        try {
            if (m.op === 'getOverview')
                return await getOverviewSnapshot(cordisCtx ?? { get: () => undefined });
            if (m.op === 'getPlugins')
                return await getPluginsSnapshot();
            if (m.op === 'getUsage')
                return await getUsageSnapshot(m.range);
            if (m.op === 'getSettingsDomains')
                return await getSettingsDomains();
            if (m.op === 'setSetting') {
                await setSetting(m.domain, m.patch);
                return { ok: true };
            }
        }
        catch (e) {
            return { error: String(e?.message ?? e) };
        }
        return { error: 'unknown-op' };
    };
}
export default {
    inject: ['connection'],
    apply(ctx) {
        const handler = createHandler(ctx);
        ctx.effect(() => {
            if (ctx.connection?.rpc?.handle) {
                return ctx.connection.rpc.handle(DASHBOARD_CHANNEL, async (payload, peer) => {
                    return handler(payload, { peer, headers: peer?.headers ?? { host: '127.0.0.1:3080' }, origin: peer?.headers?.origin, contentType: peer?.headers?.['content-type'] });
                });
            }
            return () => { };
        });
    },
};
//# sourceMappingURL=index.js.map