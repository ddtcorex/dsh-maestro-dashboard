# Changelog

All notable changes to this project are documented in this file. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-09-02

### Added

- **Maestro header redesign + 2x2 mobile overview** (#10).
- **Sidebar logo alignment** — align Maestro sidebar logo size with Settings icon (#8).

### Fixed

- **Maestro 260px like Settings** — align trigger widths and scope footer fixes (#14, #12, #11, #9).
- **Footer trigger overlap** — prevent Maestro trigger overlap with Cordis badge.

### Changed

- Rebuild client bundle for 0.1.2-alpha.2 (#7).


## [0.1.0] - 2026-08-28

Initial release of `@ddtcorex/dsh-maestro-dashboard` — unified Control Center
(Overview/Plugins/Usage) DSH-native plugin for DeepSeek Harness.

### Added

- **Host RPC** (`src/host/index.ts`): loopback-hardened channel `/dsh-maestro-dashboard`
  (`authority: loopback`) dispatching `getOverview` / `getPlugins` / `getUsage` /
  `getReviews` / `getSettingsDomains` / `setSetting` with 64KB body limit and
  Zod-validated `dashboardMethodSchema`.
- **Overview** (`overview.ts`): probes `maestroNotifier` / `maestroConfig` /
  `govardTool`, reads `~/.dsh/dsh-maestro-review/reviews.json`, incremental scan of
  `~/.dsh/sessions/*.jsonl.zstd` for 52-week heatmap + recent sessions (mtime-guarded,
  zstd decompress, tolerant skips).
- **Plugins** (`plugins.ts`): scans `cordis.patch.yml` + installed
  `@ddtcorex/dsh-maestro-*` packages, npm `dist-tags.latest` with 6h cache,
  health (`ok` / `warn` / `error`) and marketplace index.
- **Usage** (`usage.ts`): incremental session scan with per-session cache,
  pricing table (models.dev 6h TTL, only used models), totals/daily/budget.
- **Reviews** (`reviews.ts`): reads `~/.dsh/dsh-maestro-review/reviews.json`
  (legacy `~/dsh-maestro-review` fallback), sorted by `startedAt`.
- **Settings bridge** (`settings-bridge.ts`): `getSettingsDomains` / `setSetting`
  via `@ddtcorex/dsh-maestro-config-lib` (`~/.dsh/maestro/settings.json`).
- **Client** (`src/client/`): `sidebar.footer.action` trigger (Maestro logo +
  status dot, collapsed-aware) opening a fullscreen overlay with primary tabs
  Overview/Plugins/Usage; token-native `var(--dsw-*)` components `HeroKpi`,
  `Heatmap`, `Sparkline`, `PluginCard`, `PricingTable` (pure SVG, <20KB).
- **Scaffold**: `cordis.patch.yml` channel `/dsh-maestro-dashboard`,
  `tsconfig.json` `rootDir: src/host` flat `lib/index.js`, `pnpm-workspace.yaml`
  `allowBuilds.esbuild: true`, CI via `ddtcorex/dsh-maestro-ci`.

[0.1.0]: https://github.com/ddtcorex/dsh-maestro-dashboard/releases/tag/v0.1.0
