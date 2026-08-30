import type { PluginSnapshot } from './shared/types.ts'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import * as yaml from 'js-yaml'

interface GetPluginsOpts {
  patchYml?: string
  pkgVersions?: Record<string, string>
  npmLatest?: Record<string, string>
  marketplace?: Array<{ id: string; name: string; description: string; stars: number }>
}

function tryReadVersionFile(pkgJsonPath: string): string | undefined {
  try {
    if (!existsSync(pkgJsonPath)) return undefined
    const pj = JSON.parse(readFileSync(pkgJsonPath, 'utf8'))
    if (pj && typeof pj.version === 'string' && pj.version) return pj.version
  } catch {}
  return undefined
}

function isMaestroKey(k: string): boolean {
  return /^dsh-maestro-/.test(k) || /^@ddtcorex\/dsh-maestro-/.test(k)
}

function normalizeKey(k: string): string {
  return k.startsWith('@ddtcorex/') ? k.slice('@ddtcorex/'.length) : k
}

function isSemverLike(v: string): boolean {
  return /^[\^~>=<\s]*\d+\.\d+\.\d+/.test(v.trim())
}

function cleanSemver(v: string): string {
  return v.trim().replace(/^[\^~>=<\s]+/, '')
}

function getMaestroPackagesDir(): string | null {
  try {
    const curDir = dirname(fileURLToPath(import.meta.url)) // .../src/host
    const candidates: string[] = [
      join(curDir, '..', '..', '..', '..', 'packages'),
      join(curDir, '..', '..', '..', 'packages'),
      join(curDir, '..', '..', '..', '..'),
    ]
    for (const c of candidates) {
      try {
        if (existsSync(c)) {
          if (c.endsWith('packages')) {
            return c
          } else {
            const pkgDir = join(c, 'packages')
            if (existsSync(pkgDir)) return pkgDir
          }
        }
      } catch {}
    }
    const root = join(curDir, '..', '..', '..', '..')
    const pkg = join(root, 'packages')
    if (existsSync(pkg)) return pkg
    const altPkg = join(curDir, '..', '..', '..')
    if (existsSync(altPkg)) {
      try {
        const entries = readdirSync(altPkg)
        if (entries.some((e) => e.startsWith('dsh-maestro-'))) return altPkg
      } catch {}
    }
  } catch {}
  return null
}

function collectPatchIds(parsed: any): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  const push = (raw: string) => {
    const base = normalizeKey(raw)
    if (!base.startsWith('dsh-maestro-')) return
    if (seen.has(base)) return
    seen.add(base)
    out.push(base)
  }
  try {
    if (Array.isArray(parsed)) {
      for (const el of parsed) {
        if (!el || typeof el !== 'object') continue
        if (typeof (el as any).id === 'string' && isMaestroKey((el as any).id)) push((el as any).id)
        if (Array.isArray((el as any).bundles)) {
          for (const b of (el as any).bundles) if (typeof b === 'string' && isMaestroKey(b)) push(b)
        }
        if (Array.isArray((el as any).insert)) {
          for (const b of (el as any).insert) {
            if (b && typeof b === 'object' && typeof b.id === 'string' && isMaestroKey(b.id)) push(b.id)
          }
        }
      }
    } else if (parsed && typeof parsed === 'object') {
      if (Array.isArray((parsed as any).bundles)) {
        for (const b of (parsed as any).bundles) if (typeof b === 'string' && isMaestroKey(b)) push(b)
      }
      const dsh = (parsed as any).dsh
      if (dsh && dsh.profile && Array.isArray(dsh.profile.bundles)) {
        for (const b of dsh.profile.bundles) if (typeof b === 'string' && isMaestroKey(b)) push(b)
      }
    }
  } catch {}
  return out
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
    let parsedPatch: any = null
    let patchHealth: any = null
    if (patchContent) {
      try {
        parsedPatch = yaml.load(patchContent)
      } catch (e: any) {
        // tolerant: try FAILSAFE (accepts !!js), else keep empty and surface warn
        try {
          parsedPatch = yaml.load(patchContent, { schema: yaml.FAILSAFE_SCHEMA } as any)
        } catch {}
        patchHealth = { id: 'patch', status: 'warn', detail: 'cordis.patch.yml parse error: ' + String(e?.message ?? e) }
      }
    }

    // Enumerate installed: from opts or from filesystem
    let installed: PluginSnapshot['data'] extends null ? never : NonNullable<PluginSnapshot['data']>['installed'] = []
    if (opts.pkgVersions) {
      installed = Object.entries(opts.pkgVersions).map(([k, v]) => {
        const base = normalizeKey(k)
        const id = base.replace('dsh-maestro-', '')
        const latest = opts.npmLatest?.[k] ?? opts.npmLatest?.[base] ?? opts.npmLatest?.[`@ddtcorex/${base}`]
        return {
          id,
          name: `@ddtcorex/${base}`,
          version: v,
          status: 'ok' as const,
          updateAvailable: !!latest && latest !== v,
          latest,
        }
      })
    } else {
      try {
        const sources: Record<string, string> = {}
        const maestroPackagesDir = getMaestroPackagesDir()

        const resolveVersion = (base: string, raw: string | undefined): string | undefined => {
          if (raw && raw.startsWith('link:')) {
            const linkPath = raw.slice(5)
            const v = tryReadVersionFile(join(linkPath, 'package.json'))
            if (v) return v
            const nmWeb = tryReadVersionFile(join(homedir(), '.dsh', 'profiles', 'web', 'node_modules', '@ddtcorex', base, 'package.json'))
            if (nmWeb) return nmWeb
            const nmDev = tryReadVersionFile(join(homedir(), '.dsh', 'profiles', 'web-dev', 'node_modules', '@ddtcorex', base, 'package.json'))
            if (nmDev) return nmDev
            if (maestroPackagesDir) {
              const m = tryReadVersionFile(join(maestroPackagesDir, base, 'package.json'))
              if (m) return m
            }
            return undefined
          }
          if (raw && isSemverLike(raw)) {
            const nmWeb = tryReadVersionFile(join(homedir(), '.dsh', 'profiles', 'web', 'node_modules', '@ddtcorex', base, 'package.json'))
            if (nmWeb) return nmWeb
            const nmDev = tryReadVersionFile(join(homedir(), '.dsh', 'profiles', 'web-dev', 'node_modules', '@ddtcorex', base, 'package.json'))
            if (nmDev) return nmDev
            if (maestroPackagesDir) {
              const m = tryReadVersionFile(join(maestroPackagesDir, base, 'package.json'))
              if (m) return m
            }
            return cleanSemver(raw)
          }
          const nmWeb = tryReadVersionFile(join(homedir(), '.dsh', 'profiles', 'web', 'node_modules', '@ddtcorex', base, 'package.json'))
          if (nmWeb) return nmWeb
          const nmDev = tryReadVersionFile(join(homedir(), '.dsh', 'profiles', 'web-dev', 'node_modules', '@ddtcorex', base, 'package.json'))
          if (nmDev) return nmDev
          if (maestroPackagesDir) {
            const m = tryReadVersionFile(join(maestroPackagesDir, base, 'package.json'))
            if (m) return m
          }
          if (raw) return cleanSemver(raw)
          return undefined
        }

        // 1) Read profile package.jsons
        const profilePaths = [
          join(homedir(), '.dsh', 'profiles', 'web', 'package.json'),
          join(homedir(), '.dsh', 'profiles', 'web-dev', 'package.json'),
        ]
        for (const pp of profilePaths) {
          try {
            if (!existsSync(pp)) continue
            const j = JSON.parse(readFileSync(pp, 'utf8'))
            const deps: Record<string, string> = { ...(j.dependencies ?? {}), ...(j.devDependencies ?? {}) }
            for (const [k, v] of Object.entries(deps)) {
              if (!isMaestroKey(k)) continue
              const base = normalizeKey(k)
              if (sources[base]) continue
              const ver = resolveVersion(base, String(v))
              if (ver) sources[base] = ver
              else if (typeof v === 'string' && v) {
                const cleaned = cleanSemver(String(v))
                if (cleaned) sources[base] = cleaned
              }
            }
            const bundles: unknown = j?.dsh?.profile?.bundles
            if (Array.isArray(bundles)) {
              for (const b of bundles) {
                if (typeof b !== 'string' || !isMaestroKey(b)) continue
                const base = normalizeKey(b)
                if (sources[base]) continue
                const ver = resolveVersion(base, undefined)
                if (ver) sources[base] = ver
              }
            }
          } catch {}
        }

        // 2) Scan cordis.patch.yml bundles if present for additional ids
        if (parsedPatch) {
          try {
            const patchIds = collectPatchIds(parsedPatch)
            for (const base of patchIds) {
              if (sources[base]) continue
              const ver = resolveVersion(base, undefined)
              if (ver) sources[base] = ver
            }
          } catch {}
        }

        // 3) Scan maestro-harness packages dir as fallback, without hardcoding /home/kai
        if (maestroPackagesDir) {
          try {
            if (existsSync(maestroPackagesDir)) {
              for (const entry of readdirSync(maestroPackagesDir)) {
                if (!entry.startsWith('dsh-maestro-')) continue
                if (sources[entry]) continue
                try {
                  const pjPath = join(maestroPackagesDir, entry, 'package.json')
                  const ver = tryReadVersionFile(pjPath)
                  if (ver) sources[entry] = ver
                } catch {}
              }
            }
          } catch {}
        }

        installed = Object.entries(sources).map(([k, v]) => {
          const latest = opts.npmLatest?.[k] ?? opts.npmLatest?.[`@ddtcorex/${k}`]
          return {
            id: k.replace('dsh-maestro-', ''),
            name: `@ddtcorex/${k}`,
            version: v,
            status: 'ok' as const,
            updateAvailable: !!latest && latest !== v,
            latest,
          }
        })
      } catch {}
    }

    const marketplace = opts.marketplace ?? []
    const health: any[] = [{ id: 'plugins', status: 'ok' }]
    if (patchHealth) health.unshift(patchHealth)
    return {
      v: 1,
      generatedAt,
      data: { installed, marketplace, health }
    }
  } catch (e: any) {
    return {
      v: 1,
      generatedAt,
      data: { installed: [], marketplace: [], health: [{ id: 'plugins', status: 'warn', detail: String(e?.message ?? e) }] }
    }
  }
}
