import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { zstdDecompressSync } from 'node:zlib';
export async function getOverviewSnapshot(ctx) {
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
    try {
        const g = ctx?.get?.('govardTool') ?? ctx?.get?.('maestroGovard') ?? ctx?.get?.('govard');
        if (g)
            hasGovard = true;
    }
    catch { }
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
    // File probes — graceful, try/catch, no secrets in logs, pure (no mutation)
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
    const anyData = hasNotifier || hasGovard || hasConfig;
    if (!anyData) {
        return { v: 1, generatedAt, data: null };
    }
    const kpis = [
        { id: 'tunnel', label: 'Tunnel', value: hasConfig ? 'configured' : 'n/a', status: hasConfig ? 'ok' : 'warn' },
        { id: 'review', label: 'Review', value: reviewCount > 0 ? `${reviewCount} reviews` : '0 queued', status: 'ok' },
        { id: 'govard', label: 'Govard', value: hasGovard ? 'ok' : 'not installed', status: hasGovard ? 'ok' : 'warn' },
        { id: 'notifier', label: 'Notifier', value: hasNotifier ? (notifierCount > 0 ? `${notifierCount} targets` : 'ok') : 'not installed', status: hasNotifier ? 'ok' : 'warn' },
    ];
    const health = [
        { id: 'notifier', status: hasNotifier ? 'ok' : 'warn', detail: hasNotifier ? undefined : 'maestroNotifier not installed' },
        { id: 'govard', status: hasGovard ? 'ok' : 'warn', detail: hasGovard ? undefined : 'govard not installed' },
        { id: 'config', status: hasConfig ? 'ok' : 'warn', detail: hasConfig ? undefined : 'maestroConfig not installed' },
        { id: 'review', status: 'ok', detail: reviewCount > 0 ? `${reviewCount} reviews` : undefined },
    ];
    if (supervisorCount > 0)
        health.push({ id: 'supervisor', status: 'ok', detail: `${supervisorCount} reports` });
    // Real heatmap + recent sessions from ~/.dsh/sessions/*/session.jsonl.zstd (incremental, tolerant, no secrets)
    let heatmap = [];
    let sessions = [];
    try {
        const sessionsDir = join(homedir(), '.dsh', 'sessions');
        const byDate = {};
        const now = Date.now();
        // init 52*7 days zero
        for (let i = 0; i < 52 * 7; i++) {
            const d = new Date(now - (52 * 7 - 1 - i) * 86400000);
            byDate[d.toISOString().slice(0, 10)] = 0;
        }
        if (existsSync(sessionsDir)) {
            const groups = readdirSync(sessionsDir, { withFileTypes: true });
            const sessionInfos = [];
            for (const g of groups) {
                if (!g.isDirectory())
                    continue;
                const groupPath = join(sessionsDir, g.name);
                let entries = [];
                try {
                    entries = readdirSync(groupPath);
                }
                catch {
                    continue;
                }
                for (const e of entries) {
                    if (!e.endsWith('.jsonl') && !e.endsWith('.jsonl.zstd'))
                        continue;
                    const fp = join(groupPath, e);
                    let mtime = 0;
                    try {
                        mtime = statSync(fp).mtimeMs;
                    }
                    catch {
                        mtime = now;
                    }
                    const isZstd = e.endsWith('.zstd');
                    let text = '';
                    try {
                        const buf = readFileSync(fp);
                        text = isZstd ? zstdDecompressSync(buf).toString('utf8') : buf.toString('utf8');
                    }
                    catch {
                        continue;
                    }
                    let count = 0;
                    let cost = 0;
                    let lastActive = mtime;
                    for (const line of text.split('\n')) {
                        if (!line.trim())
                            continue;
                        try {
                            const obj = JSON.parse(line);
                            const ts = obj?.timestamp ?? obj?.time ?? obj?.createdAt;
                            if (ts) {
                                const d = new Date(ts).toISOString().slice(0, 10);
                                if (byDate[d] !== undefined)
                                    byDate[d] += 1;
                                else
                                    byDate[d] = 1;
                            }
                            else {
                                // fallback: count per file mtime day
                                const d = new Date(mtime).toISOString().slice(0, 10);
                                if (byDate[d] !== undefined)
                                    byDate[d] += 1;
                            }
                            count += 1;
                            if (obj?.cost)
                                cost += Number(obj.cost) || 0;
                            if (obj?.usage?.total_tokens)
                                cost += 0.001; // stub
                            if (obj?.timestamp)
                                lastActive = Math.max(lastActive, new Date(obj.timestamp).getTime());
                        }
                        catch { }
                    }
                    if (count === 0) {
                        const d = new Date(mtime).toISOString().slice(0, 10);
                        if (byDate[d] !== undefined)
                            byDate[d] += 1;
                    }
                    const sid = e.replace('.jsonl.zstd', '').replace('.jsonl', '').slice(0, 32) || g.name;
                    const title = sid.slice(0, 24);
                    sessionInfos.push({ id: sid, title, lastActive, cost });
                }
            }
            sessionInfos.sort((a, b) => b.lastActive - a.lastActive);
            sessions = sessionInfos.slice(0, 20);
            heatmap = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));
        }
        else {
            // fallback: empty heatmap with zeros
            heatmap = Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b)).map(([date, count]) => ({ date, count }));
        }
    }
    catch {
        // graceful: leave heatmap/sessions empty, client will show fallback
        heatmap = [];
        sessions = [];
    }
    return {
        v: 1,
        generatedAt,
        data: {
            kpis,
            health,
            heatmap,
            sessions,
        }
    };
}
//# sourceMappingURL=overview.js.map