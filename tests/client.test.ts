import { describe, test, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
describe('client files', () => {
  test('trigger exists and uses DSW tokens', () => {
    const s = readFileSync('src/client/trigger.tsx', 'utf8')
    expect(s).toContain('Maestro')
    expect(s).toContain('var(--dsw-alias-')
    expect(s).toContain('MaestroLogo')
  })
  test('overlay renders Overview with usage and uses DSW tokens', () => {
    const s = readFileSync('src/client/overlay.tsx', 'utf8')
    expect(s).toContain('OverviewTab')
    expect(s).toContain('usage')
    expect(s).not.toContain('Plugins')
    expect(s).toContain('var(--dsw-alias-')
    const o = readFileSync('src/client/tabs/OverviewTab.tsx', 'utf8')
    expect(o).toContain('Sparkline')
    expect(o).toContain('PricingTable')
    expect(o).toContain('Usage')
  })
  test('hero/heatmap/sparkline use SVG and tokens', () => {
    expect(readFileSync('src/client/components/HeroKpi.tsx','utf8')).toContain('var(--dsw-alias-')
    expect(readFileSync('src/client/components/Heatmap.tsx','utf8')).toContain('var(--dsw-alias-')
    expect(readFileSync('src/client/components/Sparkline.tsx','utf8')).toContain('var(--dsw-alias-brand-primary)')
  })
})
