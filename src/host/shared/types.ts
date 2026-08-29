import { z } from 'zod'

export const overviewSnapshotSchema = z.object({
  v: z.literal(1),
  generatedAt: z.number(),
  data: z.nullable(z.object({
    kpis: z.array(z.object({ id: z.string(), label: z.string(), value: z.string(), status: z.enum(['ok', 'warn', 'error']) })),
    health: z.array(z.object({ id: z.string(), status: z.enum(['ok', 'warn', 'error']), detail: z.string().optional() })),
    heatmap: z.array(z.object({ date: z.string(), count: z.number() })),
    sessions: z.array(z.object({ id: z.string(), title: z.string(), lastActive: z.number(), cost: z.number() })),
    tunnel: z.object({ mode: z.string().optional(), id: z.string().optional(), hostname: z.string().optional(), hasCredentials: z.boolean().optional() }).optional()
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
    totals: z.object({
      cost: z.number(),
      tokens: z.number(),
      requests: z.number(),
      inputTokens: z.number().optional(),
      outputTokens: z.number().optional(),
      cacheReadTokens: z.number().optional(),
      cacheWriteTokens: z.number().optional(),
    }),
    daily: z.array(z.object({
      date: z.string(),
      cost: z.number(),
      tokens: z.number(),
      inputTokens: z.number().optional(),
      outputTokens: z.number().optional(),
      cacheReadTokens: z.number().optional(),
      cacheWriteTokens: z.number().optional(),
    })),
    pricing: z.array(z.object({ model: z.string(), input: z.number(), output: z.number() })),
    warnings: z.array(z.string()).optional(),
    budget: z.object({ limit: z.number(), used: z.number() }).optional()
  }))
})

export const reviewsSnapshotSchema = z.object({
  v: z.literal(1),
  generatedAt: z.number(),
  data: z.nullable(z.object({
    reviews: z.array(z.object({
      id: z.string(),
      projectId: z.number(),
      projectPath: z.string(),
      mrIid: z.number(),
      mode: z.string(),
      scope: z.string(),
      trigger: z.string(),
      startedAt: z.number(),
      headSha: z.string(),
      status: z.string(),
      summary: z.string().optional(),
      error: z.string().optional(),
      finishedAt: z.number().optional(),
      durationMs: z.number().optional()
    })),
    health: z.array(z.object({ id: z.string(), status: z.enum(['ok', 'warn', 'error']), detail: z.string().optional() })),
    gitlabBaseUrl: z.string().optional()
  }))
})

export type OverviewSnapshot = z.infer<typeof overviewSnapshotSchema>
export type PluginSnapshot = z.infer<typeof pluginSnapshotSchema>
export type UsageSnapshot = z.infer<typeof usageSnapshotSchema>
export type ReviewsSnapshot = z.infer<typeof reviewsSnapshotSchema>

export const dashboardMethodSchema = z.discriminatedUnion('op', [
  z.object({ op: z.literal('getOverview') }),
  z.object({ op: z.literal('getPlugins') }),
  z.object({ op: z.literal('getUsage'), range: z.enum(['7d', '30d']) }),
  z.object({ op: z.literal('getReviews'), limit: z.number().min(1).max(100).optional() }),
  z.object({ op: z.literal('getSettingsDomains') }),
  z.object({ op: z.literal('setSetting'), domain: z.string(), patch: z.record(z.unknown()) })
])

export type DashboardMethod = z.infer<typeof dashboardMethodSchema>
