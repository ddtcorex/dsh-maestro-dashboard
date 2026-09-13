import { describe, expect, test } from 'vitest'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { OverviewTab } from '../src/client/tabs/OverviewTab.tsx'

// The Tunnel KPI tile renders label + value + sub. `sub` used to fall back to the
// tile's own value, so a configured-but-not-running tunnel printed
// "Tunnel / configured / configured" — the same word twice on one card.
const render = (snapshot: any) =>
  renderToStaticMarkup(React.createElement(OverviewTab as any, { snapshot }))

const occurrences = (html: string, needle: string) => html.split(needle).length - 1

describe('Overview tunnel KPI', () => {
  test('prints the configured state once, not twice', () => {
    const html = render({
      data: {
        kpis: [{ id: 'tunnel', label: 'Tunnel', value: 'configured', status: 'ok' }],
        tunnel: { hasCredentials: true },
        heatmap: [],
      },
    })
    expect(occurrences(html, 'configured')).toBe(1)
  })

  test('still shows the public hostname under a running tunnel', () => {
    const html = render({
      data: {
        kpis: [{ id: 'tunnel', label: 'Tunnel', value: 'enabled', status: 'ok' }],
        tunnel: { hostname: 'dsh-home.example.com' },
        heatmap: [],
      },
    })
    expect(html).toContain('enabled')
    expect(html).toContain('dsh-home.example.com')
  })
})
