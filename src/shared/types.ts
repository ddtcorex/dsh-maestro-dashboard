import { z } from 'zod'

export const overviewSnapshotSchema = z.object({
  v: z.literal(1),
  generatedAt: z.number(),
  data: z.nullable(z.object({
    kpis: z.array(z.object({ id: z.string(), label: z.string(), value: z.string(), status: z.enum(['ok', 'warn', 'error']) })),
    health: z.array(z.object({ id: z.string(), status: z.enum(['ok', 'warn', 'error']), detail: z.string().optional() })),
    heatmap: z.array(z.object({ date: z.string(), count: z.number() })),
    sessions: z.array(z.object({ id: z.string(), title: z.string(), lastActive: z.number(), cost: z.number() }))
  }))
})

export const pluginSnapshotSchema = z.object({
  v: z.literal(1),
  generatedAt: z.number(),
  data: z.nullable(z.object({
    installed: z.array(z.object({ id: z.string(), name: z.string(), version: z.string(), status: z.enum(['ok', 'warn', 'error']), updateAvailable: z.boolean(), latest: z.string().optional() })),
    marketplace: z.array(z.object({ id: z.string(), name: z.string(), description: z.string(), stars: z.number() })),
    health: z.array(z.object({ id: z.string(), status: z.enum(['ok', 'warn', 'error']), detail: z.string().optional() }))
  }))
})

export const usageSnapshotSchema = z.object({
  v: z.literal(1),
  generatedAt: z.number(),
  data: z.nullable(z.object({
    totals: z.object({ cost: z.number(), tokens: z.number(), requests: z.number() }),
    daily: z.array(z.object({ date: z.string(), cost: z.number(), tokens: z.number() })),
    pricing: z.array(z.object({ model: z.string(), input: z.number(), output: z.number() })),
    warnings: z.array(z.string()).optional(),
    budget: z.object({ limit: z.number(), used: z.number() }).optional()
  }))
})

export type OverviewSnapshot = z.infer<typeof overviewSnapshotSchema>
export type PluginSnapshot = z.infer<typeof pluginSnapshotSchema>
export type UsageSnapshot = z.infer<typeof usageSnapshotSchema>

export const dashboardMethodSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('getOverview') }),
  z.object({ op: z.literal('getPlugins') }),
  z.object({ op: z.literal('getUsage'), range: z.enum(['7d', '30d']) }),
  z.object({ op: z.literal('getSettingsDomains') }),
  z.object({ op: z.literal('setSetting'), domain: z.string(), patch: z.record(z.unknown()) })
])

export type DashboardMethod = z.infer<typeof dashboardMethodSchema>
