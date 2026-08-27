export declare function createHandler(cordisCtx?: any): (payload: any, ctx: {
    peer?: any;
    headers?: Record<string, string>;
    origin?: string;
    contentType?: string;
}) => Promise<{
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
} | {
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
} | string[] | {
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
} | {
    error: string;
    issues?: undefined;
    ok?: undefined;
} | {
    error: string;
    issues: import("zod").ZodIssue[];
    ok?: undefined;
} | {
    ok: boolean;
    error?: undefined;
    issues?: undefined;
}>;
declare const _default: {
    inject: readonly ["connection"];
    apply(ctx: any): void;
};
export default _default;
//# sourceMappingURL=index.d.ts.map