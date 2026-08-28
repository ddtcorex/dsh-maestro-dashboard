import type { PluginSnapshot } from './shared/types.ts';
interface GetPluginsOpts {
    patchYml?: string;
    pkgVersions?: Record<string, string>;
    npmLatest?: Record<string, string>;
    marketplace?: Array<{
        id: string;
        name: string;
        description: string;
        stars: number;
    }>;
}
export declare function getPluginsSnapshot(opts?: GetPluginsOpts): Promise<PluginSnapshot>;
export {};
//# sourceMappingURL=plugins.d.ts.map