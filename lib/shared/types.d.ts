import { z } from 'zod';
export declare const overviewSnapshotSchema: z.ZodObject<{
    v: z.ZodLiteral<1>;
    generatedAt: z.ZodNumber;
    data: z.ZodNullable<z.ZodObject<{
        kpis: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            label: z.ZodString;
            value: z.ZodString;
            status: z.ZodEnum<["ok", "warn", "error"]>;
        }, "strip", z.ZodTypeAny, {
            status: "ok" | "warn" | "error";
            value: string;
            id: string;
            label: string;
        }, {
            status: "ok" | "warn" | "error";
            value: string;
            id: string;
            label: string;
        }>, "many">;
        health: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            status: z.ZodEnum<["ok", "warn", "error"]>;
            detail: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }, {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }>, "many">;
        heatmap: z.ZodArray<z.ZodObject<{
            date: z.ZodString;
            count: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            date: string;
            count: number;
        }, {
            date: string;
            count: number;
        }>, "many">;
        sessions: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            title: z.ZodString;
            lastActive: z.ZodNumber;
            cost: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            title: string;
            lastActive: number;
            cost: number;
        }, {
            id: string;
            title: string;
            lastActive: number;
            cost: number;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        kpis: {
            status: "ok" | "warn" | "error";
            value: string;
            id: string;
            label: string;
        }[];
        health: {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }[];
        heatmap: {
            date: string;
            count: number;
        }[];
        sessions: {
            id: string;
            title: string;
            lastActive: number;
            cost: number;
        }[];
    }, {
        kpis: {
            status: "ok" | "warn" | "error";
            value: string;
            id: string;
            label: string;
        }[];
        health: {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }[];
        heatmap: {
            date: string;
            count: number;
        }[];
        sessions: {
            id: string;
            title: string;
            lastActive: number;
            cost: number;
        }[];
    }>>;
}, "strip", z.ZodTypeAny, {
    v: 1;
    generatedAt: number;
    data: {
        kpis: {
            status: "ok" | "warn" | "error";
            value: string;
            id: string;
            label: string;
        }[];
        health: {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }[];
        heatmap: {
            date: string;
            count: number;
        }[];
        sessions: {
            id: string;
            title: string;
            lastActive: number;
            cost: number;
        }[];
    } | null;
}, {
    v: 1;
    generatedAt: number;
    data: {
        kpis: {
            status: "ok" | "warn" | "error";
            value: string;
            id: string;
            label: string;
        }[];
        health: {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }[];
        heatmap: {
            date: string;
            count: number;
        }[];
        sessions: {
            id: string;
            title: string;
            lastActive: number;
            cost: number;
        }[];
    } | null;
}>;
export declare const pluginSnapshotSchema: z.ZodObject<{
    v: z.ZodLiteral<1>;
    generatedAt: z.ZodNumber;
    data: z.ZodNullable<z.ZodObject<{
        installed: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            version: z.ZodString;
            status: z.ZodEnum<["ok", "warn", "error"]>;
            updateAvailable: z.ZodBoolean;
            latest: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: "ok" | "warn" | "error";
            id: string;
            name: string;
            version: string;
            updateAvailable: boolean;
            latest?: string | undefined;
        }, {
            status: "ok" | "warn" | "error";
            id: string;
            name: string;
            version: string;
            updateAvailable: boolean;
            latest?: string | undefined;
        }>, "many">;
        marketplace: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodString;
            stars: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            description: string;
            stars: number;
        }, {
            id: string;
            name: string;
            description: string;
            stars: number;
        }>, "many">;
        health: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            status: z.ZodEnum<["ok", "warn", "error"]>;
            detail: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }, {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        health: {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }[];
        installed: {
            status: "ok" | "warn" | "error";
            id: string;
            name: string;
            version: string;
            updateAvailable: boolean;
            latest?: string | undefined;
        }[];
        marketplace: {
            id: string;
            name: string;
            description: string;
            stars: number;
        }[];
    }, {
        health: {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }[];
        installed: {
            status: "ok" | "warn" | "error";
            id: string;
            name: string;
            version: string;
            updateAvailable: boolean;
            latest?: string | undefined;
        }[];
        marketplace: {
            id: string;
            name: string;
            description: string;
            stars: number;
        }[];
    }>>;
}, "strip", z.ZodTypeAny, {
    v: 1;
    generatedAt: number;
    data: {
        health: {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }[];
        installed: {
            status: "ok" | "warn" | "error";
            id: string;
            name: string;
            version: string;
            updateAvailable: boolean;
            latest?: string | undefined;
        }[];
        marketplace: {
            id: string;
            name: string;
            description: string;
            stars: number;
        }[];
    } | null;
}, {
    v: 1;
    generatedAt: number;
    data: {
        health: {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }[];
        installed: {
            status: "ok" | "warn" | "error";
            id: string;
            name: string;
            version: string;
            updateAvailable: boolean;
            latest?: string | undefined;
        }[];
        marketplace: {
            id: string;
            name: string;
            description: string;
            stars: number;
        }[];
    } | null;
}>;
export declare const usageSnapshotSchema: z.ZodObject<{
    v: z.ZodLiteral<1>;
    generatedAt: z.ZodNumber;
    data: z.ZodNullable<z.ZodObject<{
        totals: z.ZodObject<{
            cost: z.ZodNumber;
            tokens: z.ZodNumber;
            requests: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            cost: number;
            tokens: number;
            requests: number;
        }, {
            cost: number;
            tokens: number;
            requests: number;
        }>;
        daily: z.ZodArray<z.ZodObject<{
            date: z.ZodString;
            cost: z.ZodNumber;
            tokens: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            date: string;
            cost: number;
            tokens: number;
        }, {
            date: string;
            cost: number;
            tokens: number;
        }>, "many">;
        pricing: z.ZodArray<z.ZodObject<{
            model: z.ZodString;
            input: z.ZodNumber;
            output: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            model: string;
            input: number;
            output: number;
        }, {
            model: string;
            input: number;
            output: number;
        }>, "many">;
        warnings: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        budget: z.ZodOptional<z.ZodObject<{
            limit: z.ZodNumber;
            used: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            used: number;
        }, {
            limit: number;
            used: number;
        }>>;
    }, "strip", z.ZodTypeAny, {
        totals: {
            cost: number;
            tokens: number;
            requests: number;
        };
        daily: {
            date: string;
            cost: number;
            tokens: number;
        }[];
        pricing: {
            model: string;
            input: number;
            output: number;
        }[];
        warnings?: string[] | undefined;
        budget?: {
            limit: number;
            used: number;
        } | undefined;
    }, {
        totals: {
            cost: number;
            tokens: number;
            requests: number;
        };
        daily: {
            date: string;
            cost: number;
            tokens: number;
        }[];
        pricing: {
            model: string;
            input: number;
            output: number;
        }[];
        warnings?: string[] | undefined;
        budget?: {
            limit: number;
            used: number;
        } | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    v: 1;
    generatedAt: number;
    data: {
        totals: {
            cost: number;
            tokens: number;
            requests: number;
        };
        daily: {
            date: string;
            cost: number;
            tokens: number;
        }[];
        pricing: {
            model: string;
            input: number;
            output: number;
        }[];
        warnings?: string[] | undefined;
        budget?: {
            limit: number;
            used: number;
        } | undefined;
    } | null;
}, {
    v: 1;
    generatedAt: number;
    data: {
        totals: {
            cost: number;
            tokens: number;
            requests: number;
        };
        daily: {
            date: string;
            cost: number;
            tokens: number;
        }[];
        pricing: {
            model: string;
            input: number;
            output: number;
        }[];
        warnings?: string[] | undefined;
        budget?: {
            limit: number;
            used: number;
        } | undefined;
    } | null;
}>;
export declare const reviewsSnapshotSchema: z.ZodObject<{
    v: z.ZodLiteral<1>;
    generatedAt: z.ZodNumber;
    data: z.ZodNullable<z.ZodObject<{
        reviews: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            projectId: z.ZodNumber;
            projectPath: z.ZodString;
            mrIid: z.ZodNumber;
            mode: z.ZodString;
            scope: z.ZodString;
            trigger: z.ZodString;
            startedAt: z.ZodNumber;
            headSha: z.ZodString;
            status: z.ZodString;
            summary: z.ZodOptional<z.ZodString>;
            finishedAt: z.ZodOptional<z.ZodNumber>;
            durationMs: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            status: string;
            id: string;
            projectId: number;
            projectPath: string;
            mrIid: number;
            mode: string;
            scope: string;
            trigger: string;
            startedAt: number;
            headSha: string;
            summary?: string | undefined;
            finishedAt?: number | undefined;
            durationMs?: number | undefined;
        }, {
            status: string;
            id: string;
            projectId: number;
            projectPath: string;
            mrIid: number;
            mode: string;
            scope: string;
            trigger: string;
            startedAt: number;
            headSha: string;
            summary?: string | undefined;
            finishedAt?: number | undefined;
            durationMs?: number | undefined;
        }>, "many">;
        health: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            status: z.ZodEnum<["ok", "warn", "error"]>;
            detail: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }, {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        health: {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }[];
        reviews: {
            status: string;
            id: string;
            projectId: number;
            projectPath: string;
            mrIid: number;
            mode: string;
            scope: string;
            trigger: string;
            startedAt: number;
            headSha: string;
            summary?: string | undefined;
            finishedAt?: number | undefined;
            durationMs?: number | undefined;
        }[];
    }, {
        health: {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }[];
        reviews: {
            status: string;
            id: string;
            projectId: number;
            projectPath: string;
            mrIid: number;
            mode: string;
            scope: string;
            trigger: string;
            startedAt: number;
            headSha: string;
            summary?: string | undefined;
            finishedAt?: number | undefined;
            durationMs?: number | undefined;
        }[];
    }>>;
}, "strip", z.ZodTypeAny, {
    v: 1;
    generatedAt: number;
    data: {
        health: {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }[];
        reviews: {
            status: string;
            id: string;
            projectId: number;
            projectPath: string;
            mrIid: number;
            mode: string;
            scope: string;
            trigger: string;
            startedAt: number;
            headSha: string;
            summary?: string | undefined;
            finishedAt?: number | undefined;
            durationMs?: number | undefined;
        }[];
    } | null;
}, {
    v: 1;
    generatedAt: number;
    data: {
        health: {
            status: "ok" | "warn" | "error";
            id: string;
            detail?: string | undefined;
        }[];
        reviews: {
            status: string;
            id: string;
            projectId: number;
            projectPath: string;
            mrIid: number;
            mode: string;
            scope: string;
            trigger: string;
            startedAt: number;
            headSha: string;
            summary?: string | undefined;
            finishedAt?: number | undefined;
            durationMs?: number | undefined;
        }[];
    } | null;
}>;
export type OverviewSnapshot = z.infer<typeof overviewSnapshotSchema>;
export type PluginSnapshot = z.infer<typeof pluginSnapshotSchema>;
export type UsageSnapshot = z.infer<typeof usageSnapshotSchema>;
export type ReviewsSnapshot = z.infer<typeof reviewsSnapshotSchema>;
export declare const dashboardMethodSchema: z.ZodDiscriminatedUnion<"op", [z.ZodObject<{
    op: z.ZodLiteral<"getOverview">;
}, "strip", z.ZodTypeAny, {
    op: "getOverview";
}, {
    op: "getOverview";
}>, z.ZodObject<{
    op: z.ZodLiteral<"getPlugins">;
}, "strip", z.ZodTypeAny, {
    op: "getPlugins";
}, {
    op: "getPlugins";
}>, z.ZodObject<{
    op: z.ZodLiteral<"getUsage">;
    range: z.ZodEnum<["7d", "30d"]>;
}, "strip", z.ZodTypeAny, {
    op: "getUsage";
    range: "7d" | "30d";
}, {
    op: "getUsage";
    range: "7d" | "30d";
}>, z.ZodObject<{
    op: z.ZodLiteral<"getReviews">;
    limit: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    op: "getReviews";
    limit?: number | undefined;
}, {
    op: "getReviews";
    limit?: number | undefined;
}>, z.ZodObject<{
    op: z.ZodLiteral<"getSettingsDomains">;
}, "strip", z.ZodTypeAny, {
    op: "getSettingsDomains";
}, {
    op: "getSettingsDomains";
}>, z.ZodObject<{
    op: z.ZodLiteral<"setSetting">;
    domain: z.ZodString;
    patch: z.ZodRecord<z.ZodString, z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    op: "setSetting";
    domain: string;
    patch: Record<string, unknown>;
}, {
    op: "setSetting";
    domain: string;
    patch: Record<string, unknown>;
}>]>;
export type DashboardMethod = z.infer<typeof dashboardMethodSchema>;
//# sourceMappingURL=types.d.ts.map