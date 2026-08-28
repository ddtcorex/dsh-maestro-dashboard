import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { zstdDecompressSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
function readSessionText(fp, isZstd) {
    if (!isZstd) {
        try {
            return readFileSync(fp, 'utf8');
        }
        catch {
            return '';
        }
    }
    // Try CLI zstd which handles concatenated frames correctly (each append is a frame)
    try {
        const out = execFileSync('zstd', ['-d', '-c', fp], { encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 });
        return out;
    }
    catch { }
    // Fallback: node zlib (only first frame, but better than nothing)
    try {
        const buf = readFileSync(fp);
        return zstdDecompressSync(buf).toString('utf8');
    }
    catch {
        return '';
    }
}
function extractTitle(text, fallback) {
    for (const line of text.split('\n')) {
        if (!line.trim())
            continue;
        try {
            const o = JSON.parse(line);
            // Look for first user prompt in spliced/inbox or message
            const candidates = [];
            if (o?.data?.inserted) {
                for (const ins of o.data.inserted) {
                    if (ins?.content) {
                        for (const c of ins.content)
                            if (c?.text)
                                candidates.push(String(c.text));
                    }
                    if (ins?.text)
                        candidates.push(String(ins.text));
                }
            }
            if (o?.content && typeof o.content === 'string')
                candidates.push(o.content);
            if (o?.message?.content)
                candidates.push(String(o.message.content));
            // DSH 2026+: agent/inbox/spliced with text
            for (const txt of candidates) {
                const t = txt.trim().replace(/\s+/g, ' ');
                if (t.length >= 4 && !t.startsWith('{"'))
                    return t.slice(0, 60);
            }
            // Fallback: cwd last segment
        }
        catch { }
    }
    // Fallback to cwd-derived name from fallback
    const last = fallback.split('/').pop() ?? fallback;
    return last.replace(/^--/, '').replace(/--$/, '').replace(/--/g, '/').slice(0, 40) || fallback.slice(0, 24);
}
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
    // Fallback: binary exists even if Cordis plugin not registered (go binary)
    if (!hasGovard) {
        try {
            if (existsSync('/usr/local/bin/govard') || existsSync('/usr/bin/govard') || existsSync(join(homedir(), '.local/bin/govard')))
                hasGovard = true;
        }
        catch { }
        if (!hasGovard) {
            try {
                execFileSync('govard', ['version'], { timeout: 1500, stdio: 'pipe' });
                hasGovard = true;
            }
            catch { }
        }
    }
    let govardVersion;
    if (hasGovard) {
        try {
            const out = execFileSync('govard', ['version'], { encoding: 'utf8', timeout: 1500 }).trim();
            const m = out.match(/v?\d+\.\d+\.\d+/);
            if (m)
                govardVersion = m[0];
        }
        catch { }
    }
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
    // Tunnel — read from shared maestro settings (domains.tunnel)
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
    // Also probe config root for hasConfig
    if (!hasConfig && tunnelInfo)
        hasConfig = true;
    // Always return heatmap/sessions even if core plugins not installed (graceful degradation)
    const tunnelValue = tunnelInfo?.hostname ? tunnelInfo.hostname : tunnelInfo?.mode ? `${tunnelInfo.mode}${tunnelInfo.id ? ` ${tunnelInfo.id.slice(0, 8)}` : ''}` : hasConfig ? 'configured' : 'n/a';
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
                // Collect session files: support group/<sessionDir>/session.jsonl.zstd nesting
                const sessionFiles = [];
                try {
                    const subs = readdirSync(groupPath, { withFileTypes: true });
                    for (const sub of subs) {
                        const subPath = join(groupPath, sub.name);
                        try {
                            if (sub.isDirectory()) {
                                const p1 = join(subPath, 'session.jsonl.zstd');
                                const p2 = join(subPath, 'session.jsonl');
                                if (existsSync(p1))
                                    sessionFiles.push({ fp: p1, rel: `${g.name}/${sub.name}/session.jsonl.zstd` });
                                else if (existsSync(p2))
                                    sessionFiles.push({ fp: p2, rel: `${g.name}/${sub.name}/session.jsonl` });
                                // Also handle case where sub itself is a .jsonl file inside dir (unlikely)
                                else if (sub.name.endsWith('.jsonl') || sub.name.endsWith('.jsonl.zstd')) {
                                    sessionFiles.push({ fp: subPath, rel: `${g.name}/${sub.name}` });
                                }
                            }
                            else if (sub.isFile() && (sub.name.endsWith('.jsonl') || sub.name.endsWith('.jsonl.zstd'))) {
                                sessionFiles.push({ fp: subPath, rel: `${g.name}/${sub.name}` });
                            }
                        }
                        catch { }
                    }
                    // Fallback: group directly contains session.jsonl.zstd
                    if (sessionFiles.length === 0) {
                        const p1 = join(groupPath, 'session.jsonl.zstd');
                        const p2 = join(groupPath, 'session.jsonl');
                        if (existsSync(p1))
                            sessionFiles.push({ fp: p1, rel: `${g.name}/session.jsonl.zstd` });
                        else if (existsSync(p2))
                            sessionFiles.push({ fp: p2, rel: `${g.name}/session.jsonl` });
                    }
                }
                catch {
                    continue;
                }
                for (const { fp, rel } of sessionFiles) {
                    const e = rel.split('/').pop() ?? rel;
                    let mtime = 0;
                    try {
                        mtime = statSync(fp).mtimeMs;
                    }
                    catch {
                        mtime = now;
                    }
                    const isZstd = e.endsWith('.zstd');
                    const text = readSessionText(fp, isZstd);
                    if (!text)
                        continue;
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
                    // Derive meaningful id/title: use session dir name when file is generic session.jsonl.zstd
                    let rawId;
                    if (e === 'session.jsonl.zstd' || e === 'session.jsonl') {
                        const parts = rel.split('/');
                        // group/sessionDir/file → sessionDir is the id
                        rawId = parts.length >= 3 ? parts[parts.length - 2] : g.name;
                    }
                    else {
                        rawId = e.replace('.jsonl.zstd', '').replace('.jsonl', '');
                    }
                    const sid = rawId.slice(0, 32) || g.name.slice(0, 32);
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
            tunnel: tunnelInfo ?? undefined,
        }
    };
}
//# sourceMappingURL=overview.js.map