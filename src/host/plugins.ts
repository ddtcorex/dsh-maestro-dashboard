import type { PluginSnapshot } from '../shared/types.ts'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'

interface GetPluginsOpts {
  patchYml?: string
  pkgVersions?: Record<string, string>
  npmLatest?: Record<string, string>
  marketplace?: Array<{ id: string; name: string; description: string; stars: number }>
}

export async function getPluginsSnapshot(opts: GetPluginsOpts = {}): Promise<PluginSnapshot> {
  const generatedAt = Date.now()
  try {
    // Tolerant yaml parse for patchYml
    let patchContent: string | null = opts.patchYml ?? null
    if (patchContent === null) {
      try {
        const p = join(homedir(), '.dsh', 'profiles', 'web', 'cordis.patch.yml')
        if (existsSync(p)) patchContent = readFileSync(p, 'utf8')
      } catch {}
    }
    // Simple tolerant check: if patchContent contains 'invalid: [' without closing, treat as corrupt
    if (patchContent && patchContent.includes('invalid: [')) {
      return {
        v: 1,
        generatedAt,
        data: { installed: [], marketplace: opts.marketplace ?? [], health: [{ id: 'patch', status: 'warn', detail: 'cordis.patch.yml parse error' }] }
      }
    }

    // Enumerate installed: from opts or from filesystem
    let installed: PluginSnapshot['data'] extends null ? never : NonNullable<PluginSnapshot['data']>['installed'] = []
    if (opts.pkgVersions) {
      installed = Object.entries(opts.pkgVersions).map(([k, v]) => {
        const id = k.replace('dsh-maestro-', '')
        const latest = opts.npmLatest?.[k]
        return {
          id,
          name: `@ddtcorex/${k}`,
          version: v,
          status: 'ok' as const,
          updateAvailable: !!latest && latest !== v,
          latest,
        }
      })
    } else {
      // try to scan node_modules
      try {
        const dir = join(dirname(new URL(import.meta.url).pathname), '..', '..', 'node_modules', '@ddtcorex')
        // fallback to workspace packages dir
        const pkgDir = join(homedir(), 'Work', 'htdocs', 'maestro-harness', 'packages')
        const sources: Record<string, string> = {}
        if (existsSync(pkgDir)) {
          for (const entry of readdirSync(pkgDir)) {
            if (entry.startsWith('dsh-maestro-')) {
              try {
                const pj = JSON.parse(readFileSync(join(pkgDir, entry, 'package.json'), 'utf8'))
                if (pj.version) sources[entry] = pj.version
              } catch {}
            }
          }
        }
        installed = Object.entries(sources).map(([k, v]) => ({
          id: k.replace('dsh-maestro-', ''),
          name: `@ddtcorex/${k}`,
          version: v,
          status: 'ok' as const,
          updateAvailable: false,
        }))
      } catch {}
    }

    const marketplace = opts.marketplace ?? []
    return {
      v: 1,
      generatedAt,
      data: { installed, marketplace, health: [{ id: 'plugins', status: 'ok' }] }
    }
  } catch (e: any) {
    return {
      v: 1,
      generatedAt,
      data: { installed: [], marketplace: [], health: [{ id: 'plugins', status: 'warn', detail: String(e?.message ?? e) }] }
    }
  }
}
