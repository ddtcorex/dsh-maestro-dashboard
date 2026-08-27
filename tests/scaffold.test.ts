import { readFileSync, existsSync } from 'node:fs'
import { describe, test, expect } from 'vitest'

describe('scaffold contract', () => {
  test('cordis.patch.yml has correct id and name', () => {
    const patch = readFileSync('cordis.patch.yml', 'utf8')
    expect(patch).toMatch(/id: dsh-maestro-dashboard/)
    expect(patch).toMatch(/name: '@ddtcorex\/dsh-maestro-dashboard'/)
  })
  test('channel constant has leading /', async () => {
    const { DASHBOARD_CHANNEL } = await import('../src/shared/channels.ts')
    expect(DASHBOARD_CHANNEL).toBe('/maestro-dashboard')
    expect(/^\/[A-Za-z0-9._~-]+$/.test(DASHBOARD_CHANNEL)).toBe(true)
  })
  test('lib/index.js exists after build', () => {
    expect(existsSync('lib/index.js')).toBe(true)
  })
  test('pnpm-workspace.yaml has config-lib and allowBuilds', () => {
    const ws = readFileSync('pnpm-workspace.yaml', 'utf8')
    expect(ws).toContain('dsh-maestro-config-lib')
    expect(ws).toContain('esbuild: true')
  })
})
