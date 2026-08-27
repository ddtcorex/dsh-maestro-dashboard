import { describe, test, expect } from 'vitest'
import { createHandler } from '../src/index.ts'

const loopbackCtx = { peer: { address: '127.0.0.1' }, headers: { host: '127.0.0.1:3080' } }

describe('dashboard RPC hardening', () => {
  test('rejects non-loopback Host header', async () => {
    const handler = createHandler()
    const res = await handler({ op: 'getOverview' }, { peer: { address: '10.0.0.1' }, headers: { host: '127.0.0.1.evil.com' } } as any) as any
    expect(res.ok).toBe(false)
    expect(res.error.message).toMatch(/loopback/)
  })
  test('validates op via Zod and enforces 64KB limit', async () => {
    const handler = createHandler()
    const r1 = await handler({ op: 'unknown' } as any, loopbackCtx as any) as any
    expect(r1.ok).toBe(false)
    const big = { op: 'getOverview', extra: 'x'.repeat(70 * 1024) } as any
    const r2 = await handler(big, loopbackCtx as any) as any
    expect(r2.ok).toBe(false)
  })
  test('getOverview returns versioned snapshot', async () => {
    const handler = createHandler()
    const r = await handler({ op: 'getOverview' }, loopbackCtx as any) as any
    expect(r.ok).toBe(true)
    expect(r.value.v).toBe(1)
    expect(typeof r.value.generatedAt).toBe('number')
  })
  test('getPlugins and getUsage work', async () => {
    const handler = createHandler()
    const p = await handler({ op: 'getPlugins' }, loopbackCtx as any) as any
    expect(p.ok).toBe(true)
    expect(p.value.v).toBe(1)
    const u = await handler({ op: 'getUsage', range: '7d' }, loopbackCtx as any) as any
    expect(u.ok).toBe(true)
    expect(u.value.v).toBe(1)
  })
})
