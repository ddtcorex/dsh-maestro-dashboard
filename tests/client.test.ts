import { describe, test, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
describe('client files', () => {
  test('trigger exists and uses DSW tokens', () => {
    const s = readFileSync('src/client/trigger.tsx', 'utf8')
    expect(s).toContain('Maestro')
    expect(s).toContain('var(--dsw-alias-')
    expect(s).toContain('MaestroLogo')
  })
  test('overlay renders Overview/Plugins/Usage/Reviews tabs and uses DSW tokens', () => {
    const s = readFileSync('src/client/overlay.tsx', 'utf8')
    expect(s).toContain('OverviewTab')
    expect(s).toContain('PluginsTab')
    expect(s).toContain('UsageTab')
    expect(s).toContain('ReviewsTab')
    expect(s).toContain('var(--dsw-alias-')
    expect(s).not.toContain('data-maestro-bottom-nav')
    const o = readFileSync('src/client/tabs/OverviewTab.tsx', 'utf8')
    expect(o).toContain('HeroKpi')
    expect(o).toContain('Heatmap')
    expect(o).toContain('Sparkline')
    const u = readFileSync('src/client/tabs/UsageTab.tsx', 'utf8')
    expect(u).toContain('PricingTable')
    expect(u).toContain('Sparkline')
    const p = readFileSync('src/client/tabs/PluginsTab.tsx', 'utf8')
    expect(p).toContain('PluginGrid')
    const r = readFileSync('src/client/tabs/ReviewsTab.tsx', 'utf8')
    expect(r).toContain('ReviewsTab')
    expect(r).toContain('var(--dsw-alias-')
  })
  test('hero/heatmap/sparkline use SVG and tokens', () => {
    expect(readFileSync('src/client/components/HeroKpi.tsx','utf8')).toContain('var(--dsw-alias-')
    expect(readFileSync('src/client/components/Heatmap.tsx','utf8')).toContain('var(--dsw-alias-')
    expect(readFileSync('src/client/components/Sparkline.tsx','utf8')).toContain('var(--dsw-alias-brand-primary)')
  })
  test('footer column fix is scoped to the sidebar foot area (regression: unscoped rule stacked DSH question-composer footerActions)', () => {
    const s = readFileSync('src/client/index.tsx', 'utf8')
    expect(s).toContain('maestro footer column fix')
    // Scoped: stack only footerActions living inside the sidebar foot area.
    expect(s).toContain('[class*="_footArea"] [class*="_footerActions"]')
    // Never the bare global selector that matched every _footerActions element.
    expect(s).not.toContain('\n        [class*="_footerActions"] {')
  })
})
