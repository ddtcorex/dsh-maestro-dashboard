import { describe, test, expect } from 'vitest'
import { getPluginsSnapshot } from '../src/host/plugins.ts'

describe('plugins handler', () => {
  test('installed scan finds packages with version and updateAvailable', async () => {
    const snap = await getPluginsSnapshot({
      patchYml: '- insert: []',
      pkgVersions: { 'dsh-maestro-remote': '0.1.0' },
      npmLatest: { 'dsh-maestro-remote': '0.2.0' }
    })
    const remote = snap.data!.installed.find(p => p.id === 'remote')!
    expect(remote.version).toBe('0.1.0')
    expect(remote.updateAvailable).toBe(true)
    expect(remote.latest).toBe('0.2.0')
  })
  test('tolerant yaml parse', async () => {
    const snap = await getPluginsSnapshot({ patchYml: 'invalid: [', pkgVersions: {}, npmLatest: {} })
    expect(snap.data!.installed).toEqual([])
    expect(snap.data!.health[0].status).toBe('warn')
  })
  test('no pkgVersions falls back to empty or scanned', async () => {
    const snap = await getPluginsSnapshot({ patchYml: '- insert: []' })
    expect(snap.v).toBe(1)
    expect(snap.data).not.toBeNull()
  })
})
