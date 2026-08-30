import * as React from 'react'

export function Heatmap(props: { data: Array<{ date: string; count: number }> }) {
  const max = Math.max(1, ...props.data.map((d) => d.count))
  const weeks = 53
  const days = 7
  // Responsive: fluid grid that fits container without horizontal scroll (mobile-friendly)
  // Desktop: 53×7 full year, mobile: same data but cells shrink to fit — no scroll
  return (
    <div
      style={{ display: 'grid', gap: 8, minWidth: 0, width: '100%' }}
      role="img"
      aria-label={`Activity heatmap, ${props.data.length} days`}
    >
      <style>{`
        [data-heatmap] { gap: 3px; }
        @media (max-width: 640px) { [data-heatmap] { gap: 2px !important; } [data-heatmap] [data-heatmap-cell] { border-radius: 2px !important; } }
        @media (max-width: 390px) { [data-heatmap] { gap: 1.5px !important; } }
      `}</style>
      <div
        data-heatmap
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${weeks}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${days}, minmax(0, 1fr))`,
          gap: 3,
          gridAutoFlow: 'column',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {props.data.map((d) => {
          const level = d.count === 0 ? 0 : d.count / max
          const opacity = level === 0 ? 0.06 : 0.18 + 0.82 * level
          const bg =
            level === 0
              ? 'var(--dsw-alias-bg-layer-2)'
              : 'var(--dsw-alias-state-success-primary)'
          return (
            <span
              key={d.date}
              role="gridcell"
              tabIndex={0}
              aria-label={`${d.date}: ${d.count} sessions`}
              title={`${d.date}: ${d.count}`}
              data-heatmap-cell
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 3,
                background: bg,
                opacity: level === 0 ? 1 : opacity,
                border: '1px solid var(--dsw-alias-border-l1)',
                display: 'block',
                outline: 'none',
                minWidth: 0,
                minHeight: 0,
              }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = '0 0 0 2px var(--dsw-alias-border-l3)')}
              onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
            />
          )
        })}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', flexWrap: 'wrap' }}>
        <span>Less</span>
        <span style={{ display: 'inline-flex', gap: 3 }}>
          {[0, 0.25, 0.5, 0.75, 1].map((o) => (
            <span key={o} style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--dsw-alias-state-success-primary)', opacity: o === 0 ? 0.08 : 0.18 + 0.82 * o, border: '1px solid var(--dsw-alias-border-l1)', display: 'inline-block' }} />
          ))}
        </span>
        <span>More</span>
        <span style={{ marginLeft: 'auto', opacity: 0.8 }}>{props.data.filter((d) => d.count > 0).length} active days</span>
      </div>
    </div>
  )
}
