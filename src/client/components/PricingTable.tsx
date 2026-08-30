import * as React from 'react'

export function PricingTable(props: { pricing: Array<{ model: string; input: number; output: number }> }) {
  if (!props.pricing.length) {
    return <div style={{ font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-tertiary)', padding: '12px 0' }}>No pricing data for selected range</div>
  }
  return (
    <div
      style={{
        border: '1px solid var(--dsw-alias-border-l2)',
        borderRadius: 12,
        overflow: 'hidden',
        background: 'var(--dsw-alias-bg-base)',
      }}
    >
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 420 }}>
          <thead>
            <tr style={{ background: 'var(--dsw-alias-bg-layer-2)', borderBottom: '1px solid var(--dsw-alias-border-l2)' }}>
              <th style={{ textAlign: 'left', padding: '10px 14px', font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', letterSpacing: '.04em', textTransform: 'uppercase' as any }}>Model</th>
              <th style={{ textAlign: 'right', padding: '10px 14px', font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>Input / 1K</th>
              <th style={{ textAlign: 'right', padding: '10px 14px', font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>Output / 1K</th>
            </tr>
          </thead>
          <tbody>
            {props.pricing.map((p) => (
              <tr key={p.model} style={{ borderBottom: '1px solid var(--dsw-alias-border-l1)' }}>
                <td style={{ padding: '10px 14px', font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-primary)', fontFamily: 'var(--ds-font-family-code)', wordBreak: 'break-all' }}>{p.model}</td>
                <td style={{ padding: '10px 14px', font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)', textAlign: 'right', whiteSpace: 'nowrap' as any }}>¥{Number(p.input).toFixed(4)}</td>
                <td style={{ padding: '10px 14px', font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)', textAlign: 'right', whiteSpace: 'nowrap' as any }}>¥{Number(p.output).toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
