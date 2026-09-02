import * as React from 'react'
import { createPortal } from 'react-dom'
import { BrandBadge } from './components/BrandMark.tsx'
import { OverviewTab } from './tabs/OverviewTab.tsx'
import { PluginsTab } from './tabs/PluginsTab.tsx'
import { UsageTab } from './tabs/UsageTab.tsx'
import { ReviewsTab } from './tabs/ReviewsTab.tsx'

type TabId = 'overview' | 'plugins' | 'usage' | 'reviews'

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'overview', label: 'Overview', icon: <svg width={14} height={14} viewBox="0 0 16 16" fill="none" aria-hidden><rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" /><rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" /></svg> },
  { id: 'plugins', label: 'Plugins', icon: <svg width={14} height={14} viewBox="0 0 16 16" fill="none" aria-hidden><path d="M6 3a3 3 0 0 1 3 3v2h2a1 1 0 0 1 1 1v1a3 3 0 0 1-3 3h-1v-2h1a1 1 0 0 0 1-1v-1h-2v4H6v-4H4v1a1 1 0 0 0 1 1h1v2H5a3 3 0 0 1-3-3v-1a1 1 0 0 1 1-1h2V6a3 3 0 0 1 3-3z" stroke="currentColor" strokeWidth="1" fill="none" /></svg> },
  { id: 'usage', label: 'Usage', icon: <svg width={14} height={14} viewBox="0 0 16 16" fill="none" aria-hidden><path d="M2 12l3-4 3 2 4-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /><path d="M11 4h3v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { id: 'reviews', label: 'Reviews', icon: <svg width={14} height={14} viewBox="0 0 16 16" fill="none" aria-hidden><path d="M3 3h10v8H6l-3 3V3z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /><path d="M5 7h6M5 10h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg> },
]

export function Overlay(props: { onClose?: () => void; children?: React.ReactNode; overview?: any; plugins?: any; usage?: any; reviews?: any; usageRange?: '7d' | '30d'; onUsageRangeChange?: (r: '7d' | '30d') => void; initialTab?: TabId }) {
  const [tab, setTab] = React.useState<TabId>(props.initialTab ?? 'overview')
  const dialogRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') props.onClose?.() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [props.onClose])

  React.useEffect(() => {
    const prev = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    return () => { document.documentElement.style.overflow = prev }
  }, [])

  const overlayNode = (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Maestro Dashboard" data-maestro-overlay style={{ position: 'fixed', inset: 0, zIndex: 2147483647, background: 'var(--dsw-alias-bg-base)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{`
        [data-maestro-overlay] * { scrollbar-width: thin; scrollbar-color: var(--dsw-alias-scrollbar-bg-l2) transparent; }
        [data-maestro-overlay] ::-webkit-scrollbar { width: 8px; height: 8px; }
        [data-maestro-overlay] ::-webkit-scrollbar-thumb { background: var(--dsw-alias-scrollbar-bg-l2); border-radius: 999px; }
        @media (prefers-reduced-motion: reduce) { [data-maestro-overlay] * { animation: none !important; transition: none !important; } }
        [data-maestro-tab]:focus-visible { outline: 2px solid var(--dsw-alias-border-l3); outline-offset: 2px; }
        [data-maestro-close]:focus-visible { outline: 2px solid var(--dsw-alias-border-l3); outline-offset: 2px; }
        [data-maestro-close]:focus { outline: none; }
        /* BrandBadge uses fixed #0A84FF so it stays visible on both light and dark bg-base */
        [data-maestro-logo] { background: #0A84FF !important; background-color: #0A84FF !important; color: #fff !important; }
        @media (max-width: 640px) {
          [data-maestro-header] { padding: 0 12px !important; gap: 10px !important; height: 52px !important; min-height: 52px !important; }
          [data-header-subtitle] { display: none !important; }
          [data-header-badge] { display: none !important; }
        }
        @media (max-width: 390px) {
          [data-maestro-header] { padding: 0 10px !important; gap: 8px !important; }
        }
      `}</style>

      <header data-maestro-header style={{ height: 56, minHeight: 56, flex: 'none', display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 0 16px', borderBottom: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-base)', position: 'sticky', top: 0, zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: '1 1 auto' }}>
          <BrandBadge outer={32} size={16} radius={9} />
          <div style={{ minWidth: 0, display: 'grid', gap: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flexWrap: 'wrap' as const }}>
              <span style={{ font: 'var(--dsw-font-s-strong-15)', color: 'var(--dsw-alias-label-primary)', letterSpacing: '-.01em', lineHeight: '18px', whiteSpace: 'nowrap' as const }}>Maestro</span>
              <span style={{ font: 'var(--dsw-font-xxs-12)', fontWeight: 500, letterSpacing: '.04em', textTransform: 'uppercase' as const, color: 'var(--dsw-alias-label-tertiary)', background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', padding: '2px 7px', borderRadius: 999, lineHeight: '14px', whiteSpace: 'nowrap' as const }} data-header-badge>Dashboard</span>
            </div>
            <div style={{ font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', lineHeight: '14px', letterSpacing: '.01em' }} data-header-subtitle>Unified Control Center · Overview · Plugins · Usage · Reviews</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 'none' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, font: 'var(--dsw-font-xxs-12)', color: 'var(--dsw-alias-label-tertiary)', border: '1px solid var(--dsw-alias-border-l1)', padding: '4px 8px', borderRadius: 999, background: 'var(--dsw-alias-bg-layer-1)', lineHeight: '16px' }} data-kbd-hint>
            <span style={{ background: 'var(--dsw-alias-bg-base)', border: '1px solid var(--dsw-alias-border-l1)', padding: '1px 5px', borderRadius: 6, fontFamily: 'var(--ds-font-family-code)', fontSize: 11, lineHeight: '16px' }}>Esc</span> close
          </span>
          <button data-maestro-close onClick={props.onClose} aria-label="Close dashboard" style={{ width: 36, height: 36, borderRadius: 10, border: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-layer-1)', color: 'var(--dsw-alias-label-secondary)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flex: 'none', transition: 'background 150ms ease, border-color 150ms ease, color 150ms ease' } as React.CSSProperties} onMouseEnter={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'var(--dsw-alias-bg-layer-2)'; el.style.borderColor = 'var(--dsw-alias-border-l3)'; el.style.color = 'var(--dsw-alias-label-primary)' }} onMouseLeave={(e) => { const el = e.currentTarget as HTMLButtonElement; el.style.background = 'var(--dsw-alias-bg-layer-1)'; el.style.borderColor = 'var(--dsw-alias-border-l2)'; el.style.color = 'var(--dsw-alias-label-secondary)' }} onFocus={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 0 2px var(--dsw-alias-border-l3)')} onBlur={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = 'none')}>
            <svg width={14} height={14} viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
          </button>
        </div>
      </header>

      <div style={{ flex: 'none', borderBottom: '1px solid var(--dsw-alias-border-l2)', background: 'var(--dsw-alias-bg-base)', position: 'sticky', top: 56, zIndex: 1 }}>
        <div data-maestro-tabbar style={{ maxWidth: 1200, margin: '0 auto', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, width: '100%', boxSizing: 'border-box' as any, overflowX: 'auto', overflowY: 'hidden', WebkitOverflowScrolling: 'touch' as any, scrollbarWidth: 'none' as any, overscrollBehaviorX: 'contain' as any, touchAction: 'pan-x' as any }}>
          <div style={{ display: 'flex', gap: 6, padding: 3, borderRadius: 999, background: 'var(--dsw-alias-bg-layer-2)', border: '1px solid var(--dsw-alias-border-l1)', flex: 'none' }} role="tablist" aria-label="Dashboard sections">
            {TABS.map((t) => {
              const active = tab === t.id
              return (
                <button key={t.id} data-maestro-tab role="tab" aria-selected={active} aria-controls={`maestro-panel-${t.id}`} id={`maestro-tab-${t.id}`} onClick={(e) => { setTab(t.id); try { (e.currentTarget as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }) } catch {} }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, height: 32, padding: '0 14px', borderRadius: 999, border: 'none', cursor: 'pointer', font: 'var(--dsw-font-xs-13)', fontWeight: active ? 600 : 500, background: active ? 'var(--dsw-alias-bg-base)' : 'transparent', color: active ? 'var(--dsw-alias-label-primary)' : 'var(--dsw-alias-label-secondary)', boxShadow: active ? '0 1px 2px rgba(0,0,0,.08), 0 0 0 1px var(--dsw-alias-border-l1)' : 'none', transition: 'all 200ms ease', whiteSpace: 'nowrap' as any, flex: 'none' as any, touchAction: 'manipulation' as any }}>
                  <span style={{ display: 'inline-flex', opacity: active ? 1 : 0.8 }}>{t.icon}</span>
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div style={{ flex: '1 1 auto', overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' as any, background: 'var(--dsw-alias-bg-base)', paddingBottom: 16 }}>
        <style>{`
          @media (max-width: 640px) {
            [data-kbd-hint] { display: none !important; }
            [data-maestro-tabbar] { padding: 8px 12px !important; }
            [data-maestro-content] { padding: 12px 12px !important; }
          }
          @media (max-width: 390px) {
            [data-maestro-content] { padding: 10px 10px !important; }
            [data-maestro-tabbar] { padding: 8px 10px !important; }
          }
          @media (prefers-reduced-motion: reduce) {
            [data-maestro-tab], [data-maestro-close] { transition: none !important; }
          }
        `}</style>
        <div data-maestro-content style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 16px', display: 'grid', gap: 16, boxSizing: 'border-box', width: '100%' }}>
          <div id="maestro-panel-overview" role="tabpanel" aria-labelledby="maestro-tab-overview" hidden={tab !== 'overview'} style={{ display: tab === 'overview' ? 'block' : 'none' }}><OverviewTab snapshot={props.overview} reviewsSnapshot={props.reviews} usage={props.usage} usageRange={props.usageRange} onUsageRangeChange={props.onUsageRangeChange} /></div>
          <div id="maestro-panel-plugins" role="tabpanel" aria-labelledby="maestro-tab-plugins" hidden={tab !== 'plugins'} style={{ display: tab === 'plugins' ? 'block' : 'none' }}><PluginsTab snapshot={props.plugins} /></div>
          <div id="maestro-panel-usage" role="tabpanel" aria-labelledby="maestro-tab-usage" hidden={tab !== 'usage'} style={{ display: tab === 'usage' ? 'block' : 'none' }}><UsageTab snapshot={props.usage} range={props.usageRange} onRangeChange={props.onUsageRangeChange} /></div>
          <div id="maestro-panel-reviews" role="tabpanel" aria-labelledby="maestro-tab-reviews" hidden={tab !== 'reviews'} style={{ display: tab === 'reviews' ? 'block' : 'none' }}><ReviewsTab snapshot={props.reviews} /></div>
          {props.children}
        </div>
      </div>
    </div>
  )

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(overlayNode, document.body)
  }
  return overlayNode
}
