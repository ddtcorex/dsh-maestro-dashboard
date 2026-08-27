import * as React from 'react'
export function Sparkline(props: { data: number[] }) {
  if (!props.data.length) return null
  const max = Math.max(...props.data)
  const min = Math.min(...props.data)
  const range = max - min || 1
  const w = 100
  const h = 28
  const points = props.data.map((v, i) => `${(i / (props.data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
  return (
    <svg data-sparkline width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={points} stroke="var(--dsw-alias-brand-primary)" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
