import * as React from 'react'
import { PluginGrid } from '../components/PluginCard.tsx'

const CURATED: Array<{ id: string; name: string; description: string }> = [
  { id: 'remote', name: '@ddtcorex/dsh-maestro-remote', description: 'Remote tunnel & deploy — Cloudflare quick tunnel, loopback-safe' },
  { id: 'review', name: '@ddtcorex/dsh-maestro-review', description: 'Maestro Review — incremental sessions scan, MR note trigger' },
  { id: 'govard', name: '@ddtcorex/dsh-maestro-govard', description: 'Govard — Go orchestrator for Magento/Laravel/WordPress' },
  { id: 'guard', name: '@ddtcorex/dsh-maestro-guard', description: 'Guard — approval & sandbox policy for tools' },
  { id: 'notifier', name: '@ddtcorex/dsh-maestro-notifier', description: 'Notifier — Telegram/Slack/Discord hooks for Maestro' },
  { id: 'observe', name: '@ddtcorex/dsh-maestro-observe', description: 'Observe — trace/health/cost debug plugin for other plugins' },
  { id: 'memory', name: '@ddtcorex/dsh-maestro-memory', description: 'Memory — project & session memory with sync design' },
  { id: 'mobile', name: '@ddtcorex/dsh-maestro-mobile', description: 'Mobile — responsive shell, bottom nav, touch ergonomics' },
  { id: 'config', name: '@ddtcorex/dsh-maestro-config', description: 'Config — shared settings store UI (Settings card)' },
  { id: 'diagram', name: '@ddtcorex/dsh-maestro-diagram', description: 'Diagram Studio — Mermaid/HTML arch diagrams' },
  { id: 'supervisor', name: '@ddtcorex/dsh-maestro-supervisor', description: 'Supervisor — standalone daemon, not Cordis row' },
  { id: 'dashboard', name: '@ddtcorex/dsh-maestro-dashboard', description: 'Dashboard — this Control Center (Overview/Plugins/Usage/Reviews)' },
]

export function PluginsTab(props: { snapshot?: any }) {
  const data = props.snapshot?.data
  const installed: Array<any> = data?.installed ?? []
  const health = data?.health ?? []
  const hasWarn = health.some((h: any) => h.status !== 'ok')

  const [query, setQuery] = React.useState('')
  const [filter, setFilter] = React.useState<'all' | 'updates' | 'ok'>('all')

  const cards = installed.map((p: any) => ({
    id: p.id,
    name: p.name ?? `@ddtcorex/dsh-maestro-${p.id}`,
    version: p.version ?? '0.0.0',
    status: (p.status ?? 'ok') as any,
    updateAvailable: !!p.updateAvailable,
    latest: p.latest,
    description: p.description ?? (p.updateAvailable ? `Latest ${p.latest} available` : undefined),
  }))

  const filtered = cards.filter((c) => {
    if (filter === 'updates' && !c.updateAvailable) return false
    if (filter === 'ok' && c.status !== 'ok') return false
    if (query.trim()) {
      const q = query.toLowerCase()
      return `${c.id} ${c.name} ${c.version} ${c.latest ?? ''} ${c.description ?? ''}`.toLowerCase().includes(q)
    }
    return true
  })

  const installedIds = new Set(installed.map((p: any) => p.id))
  const marketplace = CURATED.filter((c) => !installedIds.has(c.id))

  const [copied, setCopied] = React.useState<string | null>(null)
  const copy = async (text: string, key: string) => {
    try {
      await navigator.clipboard?.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(null), 1500)
    } catch {}
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <style>{`
        @media (max-width: 640px) {
          [data-plugins-health] { flex-direction: column !important; align-items: flex-start !important; padding: 12px !important; }
          [data-installed-toolbar] { grid-template-columns: 1fr !important; }
          [data-installed-toolbar] [data-search-wrap] { width: 100% !important; }
          [data-installed-toolbar] [data-count] { justify-self: start !important; }
        }
      `}</style>
      {/* Health banner */}
      <div
        data-plugins-health
        style={{
          border: '1px solid var(--dsw-alias-border-l2)',
          borderRadius: 16,
          background: hasWarn ? 'var(--dsw-alias-bg-layer-2)' : 'var(--dsw-alias-bg-layer-1)',
          padding: 14,
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ width: 10, height: 10, borderRadius: 999, background: hasWarn ? 'var(--dsw-alias-state-warn-primary)' : 'var(--dsw-alias-state-success-primary)', flex: 'none' }} />
        <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)' }}>{installed.length} installed</div>
        <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>{cards.filter((c: any) => c.updateAvailable).length} updates</div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {health.map((h: any) => (
            <span key={h.id} style={{ font: 'var(--dsw-font-xxs-12)', padding: '4px 8px', borderRadius: 999, background: h.status === 'ok' ? 'var(--dsw-alias-bg-base)' : 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', color: 'var(--dsw-alias-label-secondary)' }}>
              {h.id}: {h.status}
            </span>
          ))}
        </div>
      </div>

      {/* Toolbar: search + filter — grid prevents right overlap */}
      <div data-installed-toolbar style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 8, alignItems: 'center', minWidth: 0, maxWidth: '100%', width: '100%', boxSizing: 'border-box' as any, overflow: 'hidden' as any }}>
        <div style={{ display: 'flex', gap: 6, padding: 3, borderRadius: 999, background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', flex: 'none', minWidth: 0, maxWidth: '100%', overflow: 'hidden' as any }}>
          {(['all', 'updates', 'ok'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                height: 28,
                padding: '0 10px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                font: 'var(--dsw-font-xxs-12)',
                fontWeight: filter === f ? 600 : 500,
                background: filter === f ? 'var(--dsw-alias-bg-base)' : 'transparent',
                color: filter === f ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-tertiary)',
                boxShadow: filter === f ? '0 1px 2px rgba(0,0,0,.08), 0 0 0 1px var(--dsw-alias-border-l1)' : 'none',
                textTransform: 'capitalize' as any,
                whiteSpace: 'nowrap' as any,
              }}
            >
              {f === 'updates' ? 'Updates' : f === 'ok' ? 'Healthy' : 'All'}
            </button>
          ))}
        </div>
        <div data-search-wrap style={{ minWidth: 0, maxWidth: '100%', width: '100%', boxSizing: 'border-box' as any, overflow: 'hidden' as any, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 999, background: 'var(--dsw-alias-bg-base)', padding: '0 10px', height: 32 }}>
          <svg width={14} height={14} viewBox="0 0 16 16" fill="none" aria-hidden style={{ flex: 'none', color: 'var(--dsw-alias-label-tertiary)' }}><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" /><path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search plugins…"
            style={{ flex: '1 1 0', border: 'none', outline: 'none', background: 'transparent', font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-primary)', minWidth: 0, maxWidth: '100%', overflow: 'hidden' as any, textOverflow: 'ellipsis' as any }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--dsw-alias-label-tertiary)', display: 'inline-flex' }} aria-label="Clear">
              <svg width={12} height={12} viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            </button>
          )}
        </div>
        <span data-count style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', whiteSpace: 'nowrap' as any, justifySelf: 'end' as any }}>{filtered.length} / {cards.length}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ font: 'var(--dsw-font-s-strong-14)', color: 'var(--dsw-alias-label-primary)', margin: 0 }}>Installed</h2>
        <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>Workspace: {installed.length ? 'maestro-harness' : '—'} {query || filter !== 'all' ? `· ${filtered.length} shown` : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)', padding: 16, border: '1px dashed var(--dsw-alias-border-l2)', borderRadius: 12, textAlign: 'center' as any }}>
          No plugins match “{query || filter}” — try All or clear search.
        </div>
      ) : (
        <PluginGrid plugins={filtered} onCopy={copy} copiedKey={copied} />
      )}

      <div style={{ border: '1px dashed var(--dsw-alias-border-l2)', borderRadius: 16, padding: 16, background: 'var(--dsw-alias-bg-layer-1)', display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)' }}>Marketplace</div>
          <span style={{ font: 'var(--dsw-font-xxs-12)', padding: '2px 8px', borderRadius: 999, background: 'var(--dsw-alias-bg-base)', border: '1px solid var(--dsw-alias-border-l1)', color: 'var(--dsw-alias-label-tertiary)' }}>{marketplace.length} available</span>
          <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginLeft: 'auto' }}>Curated maestro-*</span>
        </div>
        {marketplace.length === 0 ? (
          <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)' }}>All curated plugins installed ✓</div>
        ) : (
          <div style={{ display: 'grid', gap: 8, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {marketplace.map((m) => (
              <div key={m.id} style={{ border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 12, padding: 12, display: 'grid', gap: 8, background: 'var(--dsw-alias-bg-base)' }}>
                <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)', wordBreak: 'break-all' as any }}>{m.name}</div>
                <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)', lineHeight: 1.5 }}>{m.description}</div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 4 }}>
                  <button onClick={() => copy(`dsh plugin add ${m.name}`, `mkt-${m.id}`)} style={{ font: 'var(--dsw-font-xs-13)', padding: '6px 10px', borderRadius: 999, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', cursor: 'pointer', color: 'var(--dsw-alias-label-primary)', flex: 'none' }}>{copied === `mkt-${m.id}` ? 'Copied' : 'Copy add'}</button>
                  <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginLeft: 'auto' }}>{m.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <a href="https://www.npmjs.com/search?q=dsh-plugin" target="_blank" rel="noreferrer" style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-brand-primary)', textDecoration: 'none', border: '1px solid var(--dsw-alias-border-l2)', padding: '6px 12px', borderRadius: 999, background: 'var(--dsw-alias-bg-base)', cursor: 'pointer' }}>Open npm search</a>
          <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>500+ dsh-plugin packages via jsDelivr — zero GitHub API</span>
        </div>
      </div>
    </div>
  )
}
