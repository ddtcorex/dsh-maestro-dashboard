import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
// Cache govard version 5min to avoid exec per poll
let govardCache = null;
const GOVARD_TTL = 5 * 60 * 1000;
let sessionsCache = null;
const SESSIONS_TTL = 30 * 1000;
export async function getOverviewSnapshot(ctx) {
    const now = Date.now();
    const generatedAt = Date.now();
    let hasNotifier = false;
    let notifierCount = 0;
    let hasGovard = false;
    let hasConfig = false;
    try {
        const n = ctx?.get?.('maestroNotifier');
        if (n && typeof n.ids === 'function') {
            try {
                const ids = n.ids();
                if (Array.isArray(ids))
                    notifierCount = ids.length;
            }
            catch { }
            hasNotifier = true;
        }
        else if (n)
            hasNotifier = true;
    }
    catch { }
    if (govardCache && (now - govardCache.at) < GOVARD_TTL) {
        hasGovard = govardCache.has;
    }
    else {
        try {
            const g = ctx?.get?.('govardTool') ?? ctx?.get?.('maestroGovard') ?? ctx?.get?.('govard');
            if (g)
                hasGovard = true;
        }
        catch { }
        if (!hasGovard) {
            try {
                if (existsSync('/usr/local/bin/govard') || existsSync('/usr/bin/govard') || existsSync(join(homedir(), '.local/bin/govard')))
                    hasGovard = true;
            }
            catch { }
            if (!hasGovard) {
                try {
                    execFileSync('govard', ['version'], { timeout: 800, stdio: 'pipe' });
                    hasGovard = true;
                }
                catch { }
            }
        }
        let govardVersion;
        if (hasGovard) {
            try {
                const out = execFileSync('govard', ['version'], { encoding: 'utf8', timeout: 800 }).trim();
                const m = out.match(/v?\d+\.\d+\.\d+/);
                if (m)
                    govardVersion = m[0];
            }
            catch { }
        }
        govardCache = { has: hasGovard, ver: govardVersion, at: now };
    }
    const govardVersion = govardCache?.ver;
    try {
        const c = ctx?.get?.('maestroConfig');
        if (c) {
            if (typeof c.get === 'function') {
                try {
                    c.get();
                }
                catch { }
            }
            hasConfig = true;
        }
    }
    catch { }
    let reviewCount = 0;
    try {
        const p = join(homedir(), '.dsh', 'dsh-maestro-review', 'reviews.json');
        const txt = readFileSync(p, 'utf8');
        const j = JSON.parse(txt);
        if (Array.isArray(j))
            reviewCount = j.length;
        else if (j && Array.isArray(j.reviews))
            reviewCount = j.reviews.length;
        else if (j && typeof j === 'object')
            reviewCount = Object.keys(j).length;
    }
    catch { }
    let supervisorCount = 0;
    try {
        const dir = join(homedir(), '.dsh', 'dsh-maestro-supervisor', 'reports');
        const files = readdirSync(dir);
        supervisorCount = files.filter(f => f.endsWith('.md') || f.endsWith('.json')).length;
    }
    catch { }
    try {
        if (supervisorCount === 0) {
            const alt = join(homedir(), '.dsh', 'dsh-maestro-supervisor', 'lkg');
            supervisorCount = readdirSync(alt).length;
        }
    }
    catch { }
    let tunnelInfo = null;
    try {
        const settingsPaths = [join(homedir(), '.dsh', 'maestro', 'settings.json'), join(homedir(), 'maestro', 'settings.json')];
        for (const p of settingsPaths) {
            if (!existsSync(p))
                continue;
            const j = JSON.parse(readFileSync(p, 'utf8'));
            const t = j?.domains?.tunnel ?? j?.tunnel;
            if (t && typeof t === 'object') {
                tunnelInfo = {
                    mode: typeof t.mode === 'string' ? t.mode : undefined,
                    id: typeof t.id === 'string' ? t.id : undefined,
                    hostname: typeof t.hostname === 'string' ? t.hostname : undefined,
                    hasCredentials: typeof t.credentialsFile === 'string' ? existsSync(t.credentialsFile) : undefined,
                };
                break;
            }
        }
    }
    catch { }
    if (!hasConfig && tunnelInfo)
        hasConfig = true;
    const tunnelValue = tunnelInfo?.hostname ? 'enabled' : tunnelInfo?.mode ? `${tunnelInfo.mode}${tunnelInfo.id ? ` ${tunnelInfo.id.slice(0, 8)}` : ''}` : hasConfig ? 'configured' : 'n/a';
    const govardValue = govardVersion ? `v${govardVersion.replace(/^v/, '')}` : hasGovard ? 'installed' : 'not installed';
    const kpis = [
        { id: 'tunnel', label: 'Tunnel', value: tunnelValue, status: tunnelInfo?.hostname || hasConfig ? 'ok' : 'warn' },
        { id: 'review', label: 'Review', value: reviewCount > 0 ? `${reviewCount} reviews` : '0 queued', status: 'ok' },
        { id: 'govard', label: 'Govard', value: govardValue, status: hasGovard ? 'ok' : 'warn' },
        { id: 'notifier', label: 'Notifier', value: hasNotifier ? (notifierCount > 0 ? `${notifierCount} targets` : 'ok') : 'not installed', status: hasNotifier ? 'ok' : 'warn' },
    ];
    const health = [
        { id: 'notifier', status: hasNotifier ? 'ok' : 'warn', detail: hasNotifier ? undefined : 'maestroNotifier not installed' },
        { id: 'govard', status: hasGovard ? 'ok' : 'warn', detail: hasGovard ? (govardVersion ? `govard ${govardVersion} — binary at /usr/local/bin/govard` : 'govard binary installed') : 'govard not installed' },
        { id: 'config', status: hasConfig ? 'ok' : 'warn', detail: hasConfig ? undefined : 'maestroConfig not installed' },
        { id: 'review', status: 'ok', detail: reviewCount > 0 ? `${reviewCount} reviews` : undefined },
    ];
    if (tunnelInfo?.hostname)
        health.push({ id: 'tunnel', status: 'ok', detail: `${tunnelInfo.mode ?? 'tunnel'} — ${tunnelInfo.hostname}${tunnelInfo.id ? ` (${tunnelInfo.id.slice(0, 8)})` : ''}` });
    else if (tunnelInfo)
        health.push({ id: 'tunnel', status: 'ok', detail: `tunnel ${tunnelInfo.mode ?? 'configured'}${tunnelInfo.id ? ` ${tunnelInfo.id.slice(0, 12)}` : ''}` });
    if (supervisorCount > 0)
        health.push({ id: 'supervisor', status: 'ok', detail: `${supervisorCount} reports` });
    // Heatmap via mtime only (fast, no decompress) — sessions UI removed, keep sessions empty but restore heatmap
    let heatmap = [];
    let sessions = [];
    let useCache = false;
    if (sessionsCache && (now - sessionsCache.at) < SESSIONS_TTL) {
        try {
            const curDirMtime = statSync(join(homedir(), '.dsh', 'sessions')).mtimeMs;
            if (curDirMtime === sessionsCache.dirMtime) {
                heatmap = sessionsCache.heatmap;
                sessions = sessionsCache.sessions;
                useCache = true;
            }
        }
        catch { }
    }
    if (!useCache)
        try {
            const sessionsDir = join(homedir(), '.dsh', 'sessions');
            const byDate = {};
            const nowMs = Date.now();
            for (let i = 0; i < 52 * 7; i++) {
                const d = new Date(nowMs - (52 * 7 - 1 - i) * 86400000);
                byDate[d.toISOString().slice(0, 10)] = 0;
            }
            if (existsSync(sessionsDir)) {
                const groups = readdirSync(sessionsDir, { withFileTypes: true });
                for (const g of groups) {
                    if (!g.isDirectory())
                        continue;
                    const groupPath = join(sessionsDir, g.name);
                    let subs = [];
                    try {
                        subs = readdirSync(groupPath, { withFileTypes: true });
                    }
                    catch {
                        continue;
                    }
                    for (const sub of subs) {
                        if (sub.isDirectory()) {
                            const subPath = join(groupPath, sub.name);
                            const fp = join(subPath, 'session.jsonl.zstd');
                            const altFp = join(subPath, 'session.jsonl');
                            let actualFp = null;
                            if (existsSync(fp))
                                actualFp = fp;
                            else if (existsSync(altFp))
                                actualFp = altFp;
                            else {
                                try {
                                    const files = readdirSync(subPath);
                                    const found = files.find(f => f.endsWith('.jsonl.zstd') || f.endsWith('.jsonl'));
                                    if (found)
                                        actualFp = join(subPath, found);
                                }
                                catch { }
                            }
                            if (!actualFp)
                                continue;
                            let mtime = 0;
                            try {
                                mtime = statSync(actualFp).mtimeMs;
                            }
                            catch {
                                mtime = nowMs;
                            }
                            const d = new Date(mtime).toISOString().slice(0, 10);
                            if (byDate[d] !== undefined)
                                byDate[d] += 1;
                        }
                        else {
                            const e = sub.name;
                            if (!e.endsWith('.jsonl') && !e.endsWith('.jsonl.zstd'))
                                continue;
                            const fp = join(groupPath, e);
                            let mtime = 0;
                            try {
                                mtime = statSync(fp).mtimeMs;
                            }
                            catch {
                                mtime = nowMs;
                            }
                            const d = new Date(mtime).toISOString().slice(0, 10);
                            if (byDate[d] !== undefined)
                                byDate[d] += 1;
                        }
                    }
                }
                sessions = [];
                heatmap = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));
            }
            else {
                heatmap = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));
            }
        }
        catch {
            heatmap = [];
            sessions = [];
        }
    if (!useCache) {
        let dirMtime = 0;
        try {
            dirMtime = statSync(join(homedir(), '.dsh', 'sessions')).mtimeMs;
        }
        catch { }
        sessionsCache = { heatmap, sessions, at: generatedAt, dirMtime };
    }
    const snapshot = {
        v: 1,
        generatedAt,
        data: {
            kpis,
            health,
            heatmap,
            sessions,
            tunnel: tunnelInfo ?? undefined,
        }
    };
    return snapshot;
}
export function clearOverviewCacheForTest() {
    sessionsCache = null;
    govardCache = null;
}
//# sourceMappingURL=overview.js.map