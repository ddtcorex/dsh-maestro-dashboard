import type { PluginSnapshot } from '../shared/types.ts'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import { load as yamlLoad } from 'js-yaml'

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
    // Tolerant yaml parse via js-yaml
    if (patchContent) {
      try {
        yamlLoad(patchContent)
      } catch (e: any) {
        return {
          v: 1,
          generatedAt,
          data: { installed: [], marketplace: opts.marketplace ?? [], health: [{ id: 'patch', status: 'warn', detail: 'cordis.patch.yml parse error: ' + String(e?.message ?? e) }] }
        }
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
      try {
        // Resolve workspace packages via process.cwd() — no homedir hardcode (blacklist-safe)
        const cwd = process.cwd()
        const pkgDir = join(cwd, 'packages')
        const nmDir = join(cwd, 'node_modules', '@ddtcorex')
        const sources: Record<string, string> = {}
        const scanCandidates: string[] = []
        if (existsSync(pkgDir)) scanCandidates.push(pkgDir)
        else if (existsSync(nmDir)) scanCandidates.push(nmDir)
        for (const scanDir of scanCandidates) {
          for (const entry of readdirSync(scanDir)) {
            if (entry.startsWith('dsh-maestro-')) {
              try {
                const pj = JSON.parse(readFileSync(join(scanDir, entry, 'package.json'), 'utf8'))
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
