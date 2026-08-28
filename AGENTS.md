# AGENTS.md — dsh-maestro-dashboard

> `CLAUDE.md` at the repo root is a symlink to `AGENTS.md`. Claude Code follows the same rule set as Codex CLI. Only edit `AGENTS.md` — never edit `CLAUDE.md` directly or replace the symlink with a copy.

## Purpose

Unified Control Center (Overview/Plugins/Usage) DSH-native plugin for the DeepSeek Harness (DSH). One Cordis row (`id: dsh-maestro-dashboard`) with a host half (Node) and a client half (browser Dashboard overlay).

Names by boundary: npm package = `@ddtcorex/dsh-maestro-dashboard`; Cordis patch row id = `dsh-maestro-dashboard`; RPC channel = `/dsh-maestro-dashboard` (loopback authority).

Part of the Maestro Harness suite (installed as a DSH plugin). Aggregates health, plugin catalogue, and usage/cost into one fullscreen surface triggered from `sidebar.footer.action`.

## Layout

- `src/host/index.ts` — host `apply()`: registers the loopback RPC channel `/dsh-maestro-dashboard` and dispatches `getOverview`/`getPlugins`/`getUsage`/`getReviews`/`getSettingsDomains`/`setSetting`.
- `src/host/overview.ts` — `getOverviewSnapshot(ctx)`: probes `maestroNotifier`/`maestroConfig`/`govardTool`, reads `~/.dsh/dsh-maestro-review/reviews.json`, scans `~/.dsh/sessions/*.jsonl.zstd` for heatmap + recent sessions.
- `src/host/plugins.ts` — `getPluginsSnapshot()`: parses `cordis.patch.yml`/`package.json`, detects installed `@ddtcorex/dsh-maestro-*` packages, fetches npm `dist-tags.latest` with cache, builds health.
- `src/host/usage.ts` — `getUsageSnapshot(range)`: incremental scan of `~/.dsh/sessions` (mtime check + zstd decompress), pricing fetch with TTL, totals/daily/budget.
- `src/host/reviews.ts` — `getReviewsSnapshot(limit)`: reads `~/.dsh/dsh-maestro-review/reviews.json` (legacy `~/dsh-maestro-review` fallback), sorted by `startedAt`.
- `src/host/settings-bridge.ts` — `getSettingsDomains`/`setSetting` via `@ddtcorex/dsh-maestro-config-lib` (`~/.dsh/maestro/settings.json`).
- `src/host/shared/` — `channels.ts` (`DASHBOARD_CHANNEL = '/dsh-maestro-dashboard'`) and `types.ts` (Zod schemas for snapshots + `dashboardMethodSchema` discriminated union).
- `src/client/index.tsx` — browser half (sidebar `sidebar.footer.action` trigger + fullscreen overlay, `DashboardApp` with polling).
- `src/client/trigger.tsx` — `MaestroTrigger`: logo + status dot, collapsed-aware.
- `src/client/overlay.tsx` — fullscreen portal with primary tabs Overview/Plugins/Usage.
- `src/client/tabs/` — `OverviewTab.tsx`, `PluginsTab.tsx`, `UsageTab.tsx`.
- `src/client/components/` — `HeroKpi.tsx`, `Heatmap.tsx`, `Sparkline.tsx`, `PluginCard.tsx`, `PricingTable.tsx`; all token-native `var(--dsw-*)`.
- `lib/` — committed build output. Generated; do not hand-edit.
- `scripts/build-client.mjs` — client bundle builder (esbuild → `lib/client.js` wrapped with `window.__ModuleLoader__.load`).
- `tests/*.test.ts` — vitest suites (8 files): scaffold, types, overview, plugins, usage, client, dashboard RPC, settings.

## Development

Run from the repository root:

```sh
pnpm verify   # tsc --noEmit host + client
pnpm test     # vitest run
pnpm build    # tsc host + client && node scripts/build-client.mjs  -> lib/
```

`pnpm build` is the required gate after any source change; `lib/` is committed, so a change is incomplete until the build refreshes it. `test -f lib/index.js` must pass — the host build is flat (`rootDir: src/host` → `lib/index.js`, not `lib/host/`).

## Git workflow

- Default branch `master`. No direct commits to `master` — use `feat/<topic>` / `fix/<topic>` and a PR against `ddtcorex/dsh-maestro-dashboard`.
- Conventional commits, imperative mood (`feat:`, `fix:`, `docs:`, `chore:`).
- One TDD task = one commit; never commit while `pnpm verify` is red.
- When the base moves, rebase the feature branch onto `origin/master` (single-origin workflow; there is no upstream remote).
- **Always request approval before merge or release:** never merge a PR/MR or publish a release (`git tag`/`pnpm publish`/`gh release`) without an explicit human approval — request review (`gh pr ready` / `gh pr request-review` / ask in chat) and wait for `APPROVED`. This applies to every `master` merge and every `vX.Y.Z` tag (checklist §2/§8).

## Conventions

- **Loopback-only RPC** — `authority: loopback` plus explicit `isLoopback(peer, headers)` check (socket address + `Host: 127.0.0.1:3080` exact match, reject `evil.com` rebinding), 64KB body limit, `origin` + `content-type` checks for `setSetting`.
- **Host/client split** — keep strict Host (Node) / Client (browser) split (`dsh.client.inject` + `cordis.patch.yml` with `channel: /dsh-maestro-dashboard`). Client injects `['@deepseek-ai/dsh-client-runtime','@deepseek-ai/dsh-client-ui-slots','@deepseek-ai/dsh-client-connection']`.
- **Snapshot shape** — versioned `{v:1, generatedAt, data: nullable}` for Overview/Plugins/Usage/Reviews; Zod-validated at RPC boundary (`dashboardMethodSchema` discriminatedUnion on `op`).
- **Data sources are read-only probes** — never duplicate storage; read from source-of-truth (`~/.dsh/maestro/settings.json`, `~/.dsh/sessions/*.jsonl.zstd`, `reviews.json`, `cordis.patch.yml`). Graceful degradation when a plugin is not installed (`null` snapshot → skeleton UI).
- **Token-native UI** — 0 custom theme, 0 Tailwind, all colors/spacing via `var(--dsw-alias-*)` / `var(--dsw-font-*)` / `var(--dsw-shadow-*)`; charts are pure SVG (`Heatmap`, `Sparkline`), bundle <20KB.
- **Flat lib contract** — `tsconfig.json` `rootDir: src/host` → `lib/index.js` flat; `pnpm-workspace.yaml` `allowBuilds.esbuild: true`; client tsc → `.client-build` + esbuild → `lib/client.js`.
- Strict TDD with vitest; every deterministic operation is a tool, LLM is reasoning-only.

## Validation

- `pnpm verify` + `pnpm test` green before any success claim.
- `pnpm build` + `test -f lib/index.js` (flat) must pass.
- After touching the client bundle: `pnpm build` then verify on live DSH Web (`:3080`), not just curl/grep.

## See Also

- Design spec: `docs/specs/2026-08-27-maestro-dashboard-design.md` and execution plan `docs/plans/2026-08-27-maestro-dashboard.md` at the Maestro Harness coordination workspace (`<workspace-root>/docs/`).
