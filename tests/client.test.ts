import { describe, test, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
describe('client files', () => {
  test('trigger exists and uses DSW tokens', () => {
    const s = readFileSync('src/client/trigger.tsx', 'utf8')
    expect(s).toContain('Maestro')
    expect(s).toContain('var(--dsw-alias-')
    expect(s).toContain('MaestroLogo')
  })
  test('overlay has 3 tabs and uses DSW tokens', () => {
    const s = readFileSync('src/client/overlay.tsx', 'utf8')
    expect(s).toContain('Overview')
    expect(s).toContain('Plugins')
    expect(s).toContain('Usage')
    expect(s).toContain('var(--dsw-alias-')
  })
  test('hero/heatmap/sparkline use SVG and tokens', () => {
    expect(readFileSync('src/client/components/HeroKpi.tsx','utf8')).toContain('var(--dsw-alias-')
    expect(readFileSync('src/client/components/Heatmap.tsx','utf8')).toContain('var(--dsw-alias-')
    expect(readFileSync('src/client/components/Sparkline.tsx','utf8')).toContain('var(--dsw-alias-brand-primary)')
  })
})
