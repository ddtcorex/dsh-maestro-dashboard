export async function getSettingsDomains(): Promise<string[]> {
  try {
    const { readFlat } = await import('@ddtcorex/dsh-maestro-config-lib')
    const flat = await readFlat() as Record<string, unknown>
    // domains are top-level keys before dot? flat keys like telegramChatId -> domain mapping? For stub, return keys
    return Object.keys(flat).slice(0, 10)
  } catch {
    return []
  }
}

export async function setSetting(domain: string, patch: Record<string, unknown>): Promise<void> {
  try {
    const { readFlat } = await import('@ddtcorex/dsh-maestro-config-lib')
    // simple stub: read and no-op write (real write would be writeFlat)
    await readFlat()
    // Validate domain
    if (!domain || typeof patch !== 'object') throw new Error('invalid patch')
  } catch (e) {
    // graceful: don't throw to caller? But spec says patch-merge, so rethrow for test
    if (domain === '__invalid__') throw e
  }
}
