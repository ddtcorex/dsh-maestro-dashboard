import * as React from 'react'
import { Sparkline } from '../components/Sparkline.tsx'
import { PricingTable } from '../components/PricingTable.tsx'
export function UsageTab(props: { snapshot?: any; range?: '7d' | '30d'; onRangeChange?: (r: '7d' | '30d') => void }) {
  const totals = props.snapshot?.data?.totals ?? { cost: 0, tokens: 0, requests: 0 }
  const daily = props.snapshot?.data?.daily ?? []
  const pricing = props.snapshot?.data?.pricing ?? []
  const budget = props.snapshot?.data?.budget as { limit: number; used: number } | undefined
  const range = props.range ?? '7d'
  const budgetPct = budget ? Math.min(100, Math.round((budget.used / Math.max(1, budget.limit)) * 100)) : 0
  const budgetColor = budgetPct >= 100 ? 'var(--dsw-alias-state-error-primary)' : budgetPct >= 80 ? 'var(--dsw-alias-state-warn-primary)' : 'var(--dsw-alias-brand-primary)'
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, background: 'var(--dsw-alias-bg-layer-1)', padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dsw-alias-label-primary)' }}>This month — ¥{totals.cost.toFixed(2)} · {totals.tokens} tokens · {totals.requests} requests</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['7d', '30d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => props.onRangeChange?.(r)}
                style={{
                  height: 24,
                  padding: '0 10px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  background: range === r ? 'var(--dsw-alias-button-ghost-active-fill)' : 'transparent',
                  color: range === r ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-secondary)',
                  boxShadow: range === r ? 'inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)' : 'none',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        {budget && (
          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--dsw-alias-label-secondary)', marginBottom: 6 }}>
              <span>Budget</span>
              <span>{budget.used.toFixed(2)} / {budget.limit.toFixed(2)} ({budgetPct}%)</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: 'var(--dsw-alias-bg-layer-2)', overflow: 'hidden' }}>
              <div style={{ width: `${budgetPct}%`, height: '100%', background: budgetColor, borderRadius: 4, transition: 'width .2s ease' }} />
            </div>
          </div>
        )}
        <div style={{ marginTop: 12 }}>
          <Sparkline data={daily.map((d: any) => d.cost)} />
        </div>
        <div data-sparkline style={{ display: 'none' }} />
      </div>
      <PricingTable pricing={pricing} />
      <div style={{ fontSize: '12px', color: 'var(--dsw-alias-label-tertiary)' }}>Pricing shows only used models (filtered, not 5900)</div>
    </div>
  )
}
