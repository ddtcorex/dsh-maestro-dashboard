import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
export async function getReviewsSnapshot(limit = 20) {
    const generatedAt = Date.now();
    let gitlabBaseUrl;
    try {
        const settingsPaths = [join(homedir(), '.dsh', 'maestro', 'settings.json'), join(homedir(), 'maestro', 'settings.json')];
        for (const p of settingsPaths) {
            if (!existsSync(p))
                continue;
            const j = JSON.parse(readFileSync(p, 'utf8'));
            const b = j?.domains?.gitlab?.baseUrl ?? j?.gitlab?.baseUrl;
            if (typeof b === 'string' && b) {
                gitlabBaseUrl = b.replace(/\/$/, '');
                break;
            }
        }
    }
    catch { }
    if (!gitlabBaseUrl)
        gitlabBaseUrl = 'https://git.sutunam.com';
    const file = join(homedir(), '.dsh', 'dsh-maestro-review', 'reviews.json');
    const altFile = join(homedir(), 'dsh-maestro-review', 'reviews.json');
    const altFile2 = join(homedir(), '.dsh', '.dsh-maestro-review', 'reviews.json');
    let raw = null;
    try {
        if (existsSync(altFile))
            raw = readFileSync(altFile, 'utf8');
        else if (existsSync(file))
            raw = readFileSync(file, 'utf8');
        else if (existsSync(altFile2))
            raw = readFileSync(altFile2, 'utf8');
    }
    catch { }
    if (!raw) {
        return {
            v: 1,
            generatedAt,
            data: { reviews: [], health: [{ id: 'reviews', status: 'ok', detail: 'no reviews yet' }], gitlabBaseUrl }
        };
    }
    try {
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr))
            throw new Error('not array');
        const sorted = [...arr].sort((a, b) => (b.startedAt ?? 0) - (a.startedAt ?? 0)).slice(0, Math.min(100, Math.max(1, limit)));
        const reviews = sorted.map((r) => ({
            id: String(r.id ?? ''),
            projectId: Number(r.projectId ?? 0),
            projectPath: String(r.projectPath ?? ''),
            mrIid: Number(r.mrIid ?? 0),
            mode: String(r.mode ?? ''),
            scope: String(r.scope ?? ''),
            trigger: String(r.trigger ?? ''),
            startedAt: Number(r.startedAt ?? 0),
            headSha: String(r.headSha ?? ''),
            status: String(r.status ?? 'unknown'),
            summary: r.summary ? String(r.summary) : undefined,
            error: r.error ? String(r.error) : undefined,
            finishedAt: r.finishedAt ? Number(r.finishedAt) : undefined,
            durationMs: r.finishedAt && r.startedAt ? Number(r.finishedAt) - Number(r.startedAt) : r.durationMs ? Number(r.durationMs) : undefined
        }));
        return {
            v: 1,
            generatedAt,
            data: { reviews, health: [{ id: 'reviews', status: 'ok' }], gitlabBaseUrl }
        };
    }
    catch (e) {
        return {
            v: 1,
            generatedAt,
            data: { reviews: [], health: [{ id: 'reviews', status: 'warn', detail: 'reviews.json parse error: ' + String(e?.message ?? e) }], gitlabBaseUrl }
        };
    }
}
//# sourceMappingURL=reviews.js.map