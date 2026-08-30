import * as React from 'react'

export function Sparkline(props: { data: number[]; width?: number; height?: number }) {
  if (!props.data.length) return <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)' }}>No data</div>
  const max = Math.max(...props.data)
  const min = Math.min(...props.data)
  const range = max - min || 1
  const w = props.width ?? 280
  const h = props.height ?? 48
  const pad = 4
  const innerW = w - pad * 2
  const innerH = h - pad * 2
  const points = props.data
    .map((v, i) => {
      const x = pad + (i / Math.max(1, props.data.length - 1)) * innerW
      const y = pad + innerH - ((v - min) / range) * innerH
      return `${x},${y}`
    })
    .join(' ')
  const area = `${pad},${pad + innerH} ${points} ${pad + innerW},${pad + innerH}`
  return (
    <svg
      role="img"
      aria-label={`Sparkline ${props.data.length} points`}
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: 'block', maxWidth: '100%' }}
      preserveAspectRatio="none"
    >
      <polygon points={area} fill="var(--dsw-alias-brand-primary)" opacity={0.08} />
      <polyline points={points} stroke="var(--dsw-alias-brand-primary)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {props.data.map((_, i) => {
        if (props.data.length > 30 && i % Math.ceil(props.data.length / 8) !== 0) return null
        const x = pad + (i / Math.max(1, props.data.length - 1)) * innerW
        const val = props.data[i] ?? 0
        return <circle key={i} cx={x} cy={pad + innerH - ((val - min) / range) * innerH} r={2} fill="var(--dsw-alias-bg-base)" stroke="var(--dsw-alias-brand-primary)" strokeWidth={1.2} />
      })}
    </svg>
  )
}
