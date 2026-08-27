import * as React from 'react'
import { Sparkline } from '../components/Sparkline.tsx'
import { PricingTable } from '../components/PricingTable.tsx'
export function UsageTab(props: { snapshot?: any }) {
  const totals = props.snapshot?.data?.totals ?? { cost: 0, tokens: 0, requests: 0 }
  const daily = props.snapshot?.data?.daily ?? []
  const pricing = props.snapshot?.data?.pricing ?? []
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, background: 'var(--dsw-alias-bg-layer-1)', padding: 16 }}>
        <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--dsw-alias-label-primary)' }}>This month — ¥{totals.cost.toFixed(2)} · {totals.tokens} tokens · {totals.requests} requests</div>
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
