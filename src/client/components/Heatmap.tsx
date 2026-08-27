import * as React from 'react'
export function Heatmap(props: { data: Array<{ date: string; count: number }> }) {
  const max = Math.max(1, ...props.data.map((d) => d.count))
  return (
    <div data-heatmap style={{ display: 'grid', gridTemplateColumns: 'repeat(26, 10px)', gap: 3 }}>
      {props.data.map((d) => (
        <div
          key={d.date}
          title={`${d.date}: ${d.count}`}
          style={{
            width: 10,
            height: 10,
            borderRadius: 2,
            background: `var(--dsw-alias-state-success-primary)`,
            opacity: 0.15 + 0.85 * (d.count / max),
            border: '1px solid var(--dsw-alias-border-l1)',
          }}
        />
      ))}
    </div>
  )
}
