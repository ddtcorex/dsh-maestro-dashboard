import * as React from 'react'
export function PricingTable(props: { pricing: Array<{ model: string; input: number; output: number }> }) {
  return (
    <div style={{ border: '1px solid var(--dsw-alias-border-l2)', borderRadius: 12, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--dsw-alias-border-l3)' }}>
            <th style={{ textAlign: 'left', padding: '10px 12px', font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>Model</th>
            <th style={{ textAlign: 'right', padding: '10px 12px', font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>Input</th>
            <th style={{ textAlign: 'right', padding: '10px 12px', font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>Output</th>
          </tr>
        </thead>
        <tbody>
          {props.pricing.map((p) => (
            <tr key={p.model} style={{ borderBottom: '1px solid var(--dsw-alias-border-l2)' }}>
              <td style={{ padding: '10px 12px', font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-primary)' }}>{p.model}</td>
              <td style={{ padding: '10px 12px', font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)', textAlign: 'right' }}>{p.input}</td>
              <td style={{ padding: '10px 12px', font: 'var(--dsw-font-xs-13)', color: 'var(--dsw-alias-label-secondary)', textAlign: 'right' }}>{p.output}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
