export declare function createHandler(cordisCtx?: any): (payload: any, ctx?: {
    peer?: any;
    headers?: Record<string, string>;
    origin?: string;
    contentType?: string;
}) => Promise<{
    readonly ok: false;
    readonly error: {
        readonly code: "bad-request";
        readonly message: string;
        readonly details: unknown;
    };
} | {
    readonly ok: true;
    readonly value: {
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
            tunnel?: {
                id?: string | undefined;
                mode?: string | undefined;
                hostname?: string | undefined;
                hasCredentials?: boolean | undefined;
            } | undefined;
        } | null;
    };
} | {
    readonly ok: true;
    readonly value: {
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
    };
} | {
    readonly ok: true;
    readonly value: {
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
    };
} | {
    readonly ok: true;
    readonly value: {
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
                mode: string;
                projectId: number;
                projectPath: string;
                mrIid: number;
                scope: string;
                trigger: string;
                startedAt: number;
                headSha: string;
                error?: string | undefined;
                summary?: string | undefined;
                finishedAt?: number | undefined;
                durationMs?: number | undefined;
            }[];
            gitlabBaseUrl?: string | undefined;
        } | null;
    };
} | {
    readonly ok: true;
    readonly value: string[];
} | {
    readonly ok: true;
    readonly value: {
        ok: boolean;
    };
}>;
declare const _default: {
    inject: readonly ["connection"];
    apply(ctx: any): void;
};
export default _default;
//# sourceMappingURL=index.d.ts.map