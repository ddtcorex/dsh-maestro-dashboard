import type { UsageSnapshot } from './shared/types.ts';
export declare function clearCacheForTest(): void;
interface GetUsageOpts {
    sessionsDir?: string;
    pricing?: Array<{
        model: string;
        input: number;
        output: number;
    }>;
}
export declare function getUsageSnapshot(range?: '7d' | '30d', opts?: GetUsageOpts, cordisCtx?: any): Promise<UsageSnapshot>;
export {};
//# sourceMappingURL=usage.d.ts.map