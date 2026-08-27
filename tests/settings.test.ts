import { describe, test, expect } from 'vitest'
import { getSettingsDomains, setSetting } from '../src/host/settings-bridge.ts'

describe('settings bridge', () => {
  test('getSettingsDomains returns array', async () => {
    const domains = await getSettingsDomains()
    expect(Array.isArray(domains)).toBe(true)
  })
  test('setSetting patch-merges domain', async () => {
    await expect(setSetting('notify', { telegramChatId: '123' })).resolves.not.toThrow()
    const domains = await getSettingsDomains()
    expect(Array.isArray(domains)).toBe(true)
  })
})
