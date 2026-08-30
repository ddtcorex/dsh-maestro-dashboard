import * as React from 'react'

function formatTime(ts: number) {
  if (!ts) return '-'
  return new Date(ts).toLocaleString()
}
function formatDuration(ms?: number) {
  if (!ms || ms <= 0) return '-'
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m ${rem}s`
}

type Review = {
  id: string
  projectId: number
  projectPath: string
  mrIid: number
  mode: string
  scope: string
  trigger: string
  startedAt: number
  headSha: string
  status: string
  summary?: string
  error?: string
  durationMs?: number
}

export function ReviewsTab(props: { snapshot?: any }) {
  const data = props.snapshot?.data
  const reviews: Review[] = data?.reviews ?? []
  const gitlabBaseUrl: string = data?.gitlabBaseUrl ?? 'https://git.sutunam.com'
  const [filter, setFilter] = React.useState<'all' | 'completed' | 'running' | 'failed'>('all')
  const [query, setQuery] = React.useState('')

  const filtered = reviews.filter((r) => {
    if (filter !== 'all') {
      const s = (r.status ?? '').toLowerCase()
      if (filter === 'completed' && s !== 'completed') return false
      if (filter === 'running' && s !== 'running') return false
      if (filter === 'failed' && !['failed', 'error', 'timeout'].includes(s)) return false
    }
    if (query.trim()) {
      const q = query.toLowerCase()
      return `${r.projectPath} !${r.mrIid} ${r.headSha} ${r.summary ?? ''}`.toLowerCase().includes(q)
    }
    return true
  })

  const statusColor = (s: string) => {
    const l = s.toLowerCase()
    if (l === 'completed') return 'var(--dsw-alias-state-success-primary)'
    if (l === 'running') return 'var(--dsw-alias-state-warn-primary)'
    if (['failed', 'error', 'timeout'].includes(l)) return 'var(--dsw-alias-state-error-primary)'
    return 'var(--dsw-alias-label-tertiary)'
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h2 style={{ font: 'var(--dsw-font-s-strong-14)', color: 'var(--dsw-alias-label-primary)', margin: 0 }}>Reviews</h2>
          <span style={{ font: 'var(--dsw-font-xxs-12)', minWidth: 22, height: 22, padding: '0 7px', borderRadius: 999, background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dsw-alias-label-secondary)' }}>{reviews.length}</span>
          <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--dsw-alias-state-success-primary)', display: 'inline-block' }} /> loopback-safe
          </span>
        </div>
        <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>{filtered.length} shown · {reviews.length} total</span>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 6, padding: 3, borderRadius: 999, background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', flex: 'none' }}>
          {(['all', 'completed', 'running', 'failed'] as const).map((f) => (
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
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ flex: '1 1 200px', minWidth: 180, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 999, background: 'var(--dsw-alias-bg-base)', padding: '0 10px', height: 32 }}>
          <svg width={14} height={14} viewBox="0 0 16 16" fill="none" aria-hidden style={{ flex: 'none', color: 'var(--dsw-alias-label-tertiary)' }}><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.2" /><path d="M11 11 L14 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search project, MR, SHA…"
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-primary)', minWidth: 0 }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--dsw-alias-label-tertiary)', display: 'inline-flex' }} aria-label="Clear">
              <svg width={12} height={12} viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            </button>
          )}
        </div>
      </div>

      {!reviews.length ? (
        <div style={{ border: '1px dashed var(--dsw-alias-border-l2)', borderRadius: 16, padding: 24, textAlign: 'center' as any, background: 'var(--dsw-alias-bg-layer-1)', display: 'grid', gap: 8, placeItems: 'center' }}>
          <span style={{ width: 32, height: 32, borderRadius: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--dsw-alias-bg-base)', border: '1px solid var(--dsw-alias-border-l1)', color: 'var(--dsw-alias-label-tertiary)' }}>
            <svg width={16} height={16} viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 3h10v8H6l-3 3V3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
          </span>
          <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)' }}>No reviews yet</div>
          <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)', maxWidth: 420 }}>Trigger a Maestro Review from the MR note (mention + scope). Loopback-safe, incremental `reviews.json` scan.</div>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)', padding: '12px 0', textAlign: 'center' as any }}>No results for “{query}” in {filter}</div>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {filtered.map((r) => {
            const mrUrl = r.projectPath && r.mrIid ? `${gitlabBaseUrl}/${r.projectPath}/-/merge_requests/${r.mrIid}` : ''
            const status = r.status ?? 'unknown'
            return (
              <div
                key={r.id}
                style={{
                  border: '1px solid var(--dsw-alias-border-l2)',
                  borderRadius: 16,
                  background: 'var(--dsw-alias-bg-layer-1)',
                  padding: 14,
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', minWidth: 0 }}>
                  <span style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as any }}>{r.projectPath} !{r.mrIid}</span>
                  <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginLeft: 'auto', whiteSpace: 'nowrap' as any, display: 'inline-flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span>{formatTime(r.startedAt)}</span>
                    <span aria-hidden>·</span>
                    <span>{formatDuration(r.durationMs)}</span>
                    {r.headSha && <><span aria-hidden>·</span><span style={{ fontFamily: 'var(--ds-font-family-code)', color: 'var(--dsw-alias-label-secondary)' }}>{r.headSha.slice(0, 7)}</span></>}
                  </span>
                  <span style={{ font: 'var(--dsw-font-xxs-12)', padding: '2px 8px', borderRadius: 999, background: statusColor(status), color: '#fff', fontWeight: 600, flex: 'none', textTransform: 'capitalize' as any }}>{status}</span>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {r.mode && <span style={{ font: 'var(--dsw-font-xxs-12)', padding: '3px 8px', borderRadius: 999, background: 'var(--dsw-alias-bg-base)', border: '1px solid var(--dsw-alias-border-l1)', color: 'var(--dsw-alias-label-secondary)' }}>{r.mode}</span>}
                  {r.scope && <span style={{ font: 'var(--dsw-font-xxs-12)', padding: '3px 8px', borderRadius: 999, background: 'var(--dsw-alias-bg-base)', border: '1px solid var(--dsw-alias-border-l1)', color: 'var(--dsw-alias-label-secondary)' }}>{r.scope}</span>}
                  {r.trigger && <span style={{ font: 'var(--dsw-font-xxs-12)', padding: '3px 8px', borderRadius: 999, background: 'var(--dsw-alias-bg-base)', border: '1px solid var(--dsw-alias-border-l1)', color: 'var(--dsw-alias-label-tertiary)' }}>{r.trigger}</span>}
                  {r.projectId ? <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', alignSelf: 'center' }}>#{r.projectId}</span> : null}
                </div>

                {r.error && (
                  <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-state-error-primary)', background: 'var(--dsw-alias-bg-base)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 10, padding: '8px 10px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {r.error.slice(0, 600)}
                  </div>
                )}

                {r.summary && (
                  <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)', background: 'var(--dsw-alias-bg-base)', border: '1px solid var(--dsw-alias-border-l1)', borderRadius: 12, padding: '10px 12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.5, maxHeight: 240, overflow: 'auto' }}>
                    {r.summary.slice(0, 1200)}
                  </div>
                )}

                {mrUrl && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <a href={mrUrl} target="_blank" rel="noreferrer" style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-brand-primary)', textDecoration: 'none', wordBreak: 'break-all', flex: '1 1 auto', minWidth: 0 }}>{mrUrl}</a>
                    <button
                      onClick={() => navigator.clipboard?.writeText(mrUrl)}
                      style={{ font: 'var(--dsw-font-xxs-12)', padding: '6px 10px', borderRadius: 999, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-base)', cursor: 'pointer', color: 'var(--dsw-alias-label-primary)', flex: 'none' }}
                    >
                      Copy
                    </button>
                    <a href={mrUrl} target="_blank" rel="noreferrer" style={{ font: 'var(--dsw-font-xxs-12)', padding: '6px 10px', borderRadius: 999, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-base)', color: 'var(--dsw-alias-label-primary)', textDecoration: 'none', flex: 'none' }}>
                      Open
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
