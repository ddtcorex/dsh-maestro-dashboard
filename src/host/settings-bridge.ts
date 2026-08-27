export async function getSettingsDomains(): Promise<string[]> {
  try {
    const { load } = await import('@ddtcorex/dsh-maestro-config-lib')
    const doc = await load()
    return Object.keys(doc.domains)
  } catch {
    return []
  }
}

export async function setSetting(domain: string, patch: Record<string, unknown>): Promise<void> {
  if (!domain || typeof patch !== 'object' || patch === null) throw new Error('invalid patch')
  const { set } = await import('@ddtcorex/dsh-maestro-config-lib')
  await set(domain, patch)
}
