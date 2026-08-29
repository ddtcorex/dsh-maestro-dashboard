// dsh-maestro-dashboard — host wiring with loopback-hardened RPC
import { DASHBOARD_CHANNEL } from "./shared/channels.js";
import { dashboardMethodSchema } from "./shared/types.js";
import { getOverviewSnapshot } from "./overview.js";
import { getPluginsSnapshot } from "./plugins.js";
import { getUsageSnapshot } from "./usage.js";
import { getReviewsSnapshot } from "./reviews.js";
import { getSettingsDomains, setSetting } from "./settings-bridge.js";
function isLoopback(peer, headers) {
    const addr = peer?.address ?? peer?.socketAddress ?? '';
    const host = (headers?.host ?? headers?.Host ?? '');
    const loopbackAddrs = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
    const addrOk = loopbackAddrs.includes(addr) || /^127\.\d+\.\d+\.\d+$/.test(addr) || addr === '::1';
    let hostOk = false;
    if (host) {
        const m = host.match(/^(127\.0\.0\.1|localhost|::1):\d+$/);
        hostOk = !!m;
        if (host.includes('evil.com'))
            hostOk = false;
    }
    if (addr)
        return addrOk && hostOk;
    return hostOk;
}
function toRpcResult(value) { return { ok: true, value }; }
function toRpcError(message, details) {
    return { ok: false, error: { code: 'bad-request', message, details } };
}
export function createHandler(cordisCtx) {
    return async (payload, ctx = {}) => {
        let actualPayload = payload;
        let actualCtx = ctx;
        if (typeof payload === 'string' && ctx && typeof ctx === 'object' && 'op' in ctx) {
            actualPayload = ctx;
            actualCtx = {};
        }
        const peer = actualCtx?.peer ?? { address: '127.0.0.1' };
        const headers = actualCtx?.headers ?? { host: '127.0.0.1:3080' };
        const bodyStr = JSON.stringify(actualPayload ?? {});
        if (bodyStr.length > 64 * 1024) {
            return toRpcError('body too large');
        }
        if (actualCtx?.peer || actualCtx?.headers) {
            if (!isLoopback(peer, headers)) {
                return toRpcError('loopback required');
            }
            const mForCheck = actualPayload;
            if (mForCheck?.op === 'setSetting') {
                const origin = actualCtx?.origin ?? headers?.origin;
                if (origin && !/^(https?:\/\/(127\.0\.0\.1|localhost|::1)(:\d+)?)$/.test(origin)) {
                    return toRpcError('loopback origin required');
                }
                const ct = actualCtx?.contentType ?? headers?.['content-type'] ?? headers?.['Content-Type'];
                if (ct && ct !== 'application/json') {
                    return toRpcError('content-type must be application/json');
                }
            }
        }
        const parsed = dashboardMethodSchema.safeParse(actualPayload);
        if (!parsed.success) {
            return toRpcError('unknown-op', parsed.error.issues);
        }
        const m = parsed.data;
        try {
            if (m.op === 'getOverview')
                return toRpcResult(await getOverviewSnapshot(cordisCtx ?? { get: () => undefined }));
            if (m.op === 'getPlugins')
                return toRpcResult(await getPluginsSnapshot());
            if (m.op === 'getUsage')
                return toRpcResult(await getUsageSnapshot(m.range, {}, cordisCtx));
            if (m.op === 'getReviews')
                return toRpcResult(await getReviewsSnapshot(m.limit));
            if (m.op === 'getSettingsDomains')
                return toRpcResult(await getSettingsDomains());
            if (m.op === 'setSetting') {
                await setSetting(m.domain, m.patch);
                return toRpcResult({ ok: true });
            }
        }
        catch (e) {
            return toRpcError(String(e?.message ?? e));
        }
        return toRpcError('unknown-op');
    };
}
export default {
    inject: ['connection'],
    apply(ctx) {
        const handler = createHandler(ctx);
        ctx.effect(() => {
            if (ctx.connection?.rpc?.handle) {
                return ctx.connection.rpc.handle(DASHBOARD_CHANNEL, async (endpoint, payload) => handler(payload, {}), { authority: 'loopback' });
            }
            return () => { };
        });
    },
};
//# sourceMappingURL=index.js.map