import * as React from 'react'
import { Sparkline } from '../components/Sparkline.tsx'
import { PricingTable } from '../components/PricingTable.tsx'

export function UsageTab(props: { snapshot?: any; range?: '7d' | '30d' | undefined; onRangeChange?: ((r: '7d' | '30d') => void) | undefined }) {
  const data = props.snapshot?.data
  const totals = data?.totals ?? { cost: 0, tokens: 0, requests: 0, inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0 }
  const daily: Array<any> = data?.daily ?? []
  const pricing: Array<any> = data?.pricing ?? []
  const budget = data?.budget as { limit: number; used: number } | undefined
  const range = props.range ?? '7d'
  const budgetPct = budget ? Math.min(100, Math.round((budget.used / Math.max(1, budget.limit)) * 100)) : 0
  const budgetColor = budgetPct >= 100 ? 'var(--dsw-alias-state-error-primary)' : budgetPct >= 80 ? 'var(--dsw-alias-state-warn-primary)' : 'var(--dsw-alias-brand-primary)'

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {/* Range pill */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ font: 'var(--dsw-font-s-strong-14)', color: 'var(--dsw-alias-label-primary)', margin: 0 }}>Usage & Cost</h2>
        <div style={{ display: 'flex', gap: 6, padding: 3, borderRadius: 999, background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)' }} role="tablist" aria-label="Range">
          {(['7d', '30d'] as const).map((r) => (
            <button
              key={r}
              role="tab"
              aria-selected={range === r}
              onClick={() => props.onRangeChange?.(r)}
              style={{
                height: 28,
                minWidth: 44,
                padding: '0 12px',
                borderRadius: 999,
                border: 'none',
                cursor: 'pointer',
                font: 'var(--dsw-font-xxs-12)',
                fontWeight: 600,
                background: range === r ? 'var(--dsw-alias-bg-base)' : 'transparent',
                color: range === r ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-tertiary)',
                boxShadow: range === r ? '0 1px 2px rgba(0,0,0,.08), 0 0 0 1px var(--dsw-alias-border-l1)' : 'none',
                transition: 'all 200ms ease',
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* KPI 3 */}
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(3, minmax(0,1fr))' }} data-usage-kpi>
        <style>{`
          @media (max-width: 768px) { [data-usage-kpi] { grid-template-columns: 1fr !important; } }
        `}</style>
        <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 16, padding: '14px 16px', background: 'var(--dsw-alias-bg-layer-1)' }}>
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', letterSpacing: '.04em', textTransform: 'uppercase' as any }}>Cost</div>
          <div style={{ font: 'var(--dsw-font-markdown-h3)', color: 'var(--dsw-alias-label-primary)', marginTop: 6 }}>¥{Number(totals.cost ?? 0).toFixed(2)}</div>
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginTop: 4 }}>{Number(totals.requests ?? 0)} requests · {range}</div>
        </div>
        <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 16, padding: '14px 16px', background: 'var(--dsw-alias-bg-layer-1)' }}>
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', letterSpacing: '.04em', textTransform: 'uppercase' as any }}>Tokens</div>
          <div style={{ font: 'var(--dsw-font-markdown-h3)', color: 'var(--dsw-alias-label-primary)', marginTop: 6 }}>{Number(totals.tokens ?? 0).toLocaleString()}</div>
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-secondary)', marginTop: 6, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span>In {Number(totals.inputTokens ?? 0).toLocaleString()}</span><span aria-hidden>·</span><span>Out {Number(totals.outputTokens ?? 0).toLocaleString()}</span>
            {totals.cacheReadTokens ? <><span aria-hidden>·</span><span>Cache {Number(totals.cacheReadTokens).toLocaleString()}</span></> : null}
          </div>
        </div>
        <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 16, padding: '14px 16px', background: 'var(--dsw-alias-bg-layer-1)' }}>
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', letterSpacing: '.04em', textTransform: 'uppercase' as any }}>Avg / request</div>
          <div style={{ font: 'var(--dsw-font-markdown-h3)', color: 'var(--dsw-alias-label-primary)', marginTop: 6 }}>¥{((Number(totals.cost ?? 0) / Math.max(1, Number(totals.requests ?? 0)))).toFixed(4)}</div>
          <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', marginTop: 4 }}>{daily.length} days · {Number(totals.requests ?? 0)} req</div>
        </div>
      </div>

      {budget && (
        <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 16, background: 'var(--dsw-alias-bg-layer-1)', padding: 16, display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', flexWrap: 'wrap', gap: 8 }}>
            <span style={{ fontWeight: 600, color: 'var(--dsw-alias-label-primary)' }}>Budget</span>
            <span>{budget.used.toFixed(2)} / {budget.limit.toFixed(2)} ({budgetPct}%)</span>
          </div>
          <div style={{ height: 10, borderRadius: 999, background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden', border: '1px solid var(--dsw-alias-border-l1)' }}>
            <div style={{ width: `${budgetPct}%`, height: '100%', background: budgetColor, borderRadius: 999, transition: 'width 400ms ease' }} />
          </div>
        </div>
      )}

      <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 16, background: 'var(--dsw-alias-bg-layer-1)', padding: 16, display: 'grid', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)' }}>Daily cost — {range}</div>
          <span style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>{daily.length} days</span>
        </div>
        <Sparkline data={daily.map((d: any) => Number(d.cost ?? 0))} height={64} />
        <div style={{ display: 'grid', gap: 6, gridTemplateColumns: 'repeat(auto-fill, minmax(110px,1fr))', font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>
          {daily.slice(-7).map((d: any) => (
            <span key={d.date} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, border: '1px solid var(--dsw-alias-border-l1)', padding: '6px 8px', borderRadius: 8, background: 'var(--dsw-alias-bg-base)' }}>
              <span>{d.date.slice(5)}</span><span style={{ color: 'var(--dsw-alias-label-primary)', fontWeight: 600 }}>¥{Number(d.cost).toFixed(2)}</span>
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        <div style={{ font: 'var(--dsw-font-xs-strong-13)', color: 'var(--dsw-alias-label-primary)' }}>Pricing (used models only)</div>
        <PricingTable pricing={pricing} />
        <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>Filtered to models with usage in selected range.</div>
      </div>
    </div>
  )
}
