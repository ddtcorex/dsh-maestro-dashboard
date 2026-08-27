import type { OverviewSnapshot } from '../shared/types.ts'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

export async function getOverviewSnapshot(ctx: any): Promise<OverviewSnapshot> {
  const generatedAt = Date.now()
  let hasNotifier = false
  let notifierCount = 0
  let hasGovard = false
  let hasConfig = false
  try {
    const n = ctx?.get?.('maestroNotifier')
    if (n && typeof n.ids === 'function') {
      try { const ids = n.ids(); if (Array.isArray(ids)) notifierCount = ids.length } catch {}
      hasNotifier = true
    } else if (n) hasNotifier = true
  } catch {}
  try {
    const g = ctx?.get?.('govardTool') ?? ctx?.get?.('maestroGovard') ?? ctx?.get?.('govard')
    if (g) hasGovard = true
  } catch {}
  try {
    const c = ctx?.get?.('maestroConfig')
    if (c) {
      if (typeof c.get === 'function') { try { c.get() } catch {} }
      hasConfig = true
    }
  } catch {}
  // File probes — graceful, try/catch, no secrets in logs, pure (no mutation)
  let reviewCount = 0
  try {
    const p = join(homedir(), '.dsh', 'dsh-maestro-review', 'reviews.json')
    const txt = readFileSync(p, 'utf8')
    const j = JSON.parse(txt)
    if (Array.isArray(j)) reviewCount = j.length
    else if (j && Array.isArray((j as any).reviews)) reviewCount = (j as any).reviews.length
    else if (j && typeof j === 'object') reviewCount = Object.keys(j as object).length
  } catch {}
  let supervisorCount = 0
  try {
    const dir = join(homedir(), '.dsh', 'dsh-maestro-supervisor', 'reports')
    const files = readdirSync(dir)
    supervisorCount = files.filter(f => f.endsWith('.md') || f.endsWith('.json')).length
  } catch {}
  try {
    if (supervisorCount === 0) {
      const alt = join(homedir(), '.dsh', 'dsh-maestro-supervisor', 'lkg')
      supervisorCount = readdirSync(alt).length
    }
  } catch {}

  const anyData = hasNotifier || hasGovard || hasConfig
  if (!anyData) {
    return { v: 1, generatedAt, data: null }
  }

  const kpis: Array<{ id: string; label: string; value: string; status: 'ok' | 'warn' | 'error' }> = [
    { id: 'tunnel', label: 'Tunnel', value: hasConfig ? 'configured' : 'n/a', status: hasConfig ? 'ok' : 'warn' },
    { id: 'review', label: 'Review', value: reviewCount > 0 ? `${reviewCount} reviews` : '0 queued', status: 'ok' },
    { id: 'govard', label: 'Govard', value: hasGovard ? 'ok' : 'not installed', status: hasGovard ? 'ok' : 'warn' },
    { id: 'notifier', label: 'Notifier', value: hasNotifier ? (notifierCount > 0 ? `${notifierCount} targets` : 'ok') : 'not installed', status: hasNotifier ? 'ok' : 'warn' },
  ]
  const health: Array<{ id: string; status: 'ok' | 'warn' | 'error'; detail?: string }> = [
    { id: 'notifier', status: hasNotifier ? 'ok' : 'warn', detail: hasNotifier ? undefined : 'maestroNotifier not installed' },
    { id: 'govard', status: hasGovard ? 'ok' : 'warn', detail: hasGovard ? undefined : 'govard not installed' },
    { id: 'config', status: hasConfig ? 'ok' : 'warn', detail: hasConfig ? undefined : 'maestroConfig not installed' },
    { id: 'review', status: 'ok', detail: reviewCount > 0 ? `${reviewCount} reviews` : undefined },
  ]
  if (supervisorCount > 0) health.push({ id: 'supervisor', status: 'ok', detail: `${supervisorCount} reports` })
  return {
    v: 1,
    generatedAt,
    data: {
      kpis,
      health,
      heatmap: [],
      sessions: [],
    }
  }
}
