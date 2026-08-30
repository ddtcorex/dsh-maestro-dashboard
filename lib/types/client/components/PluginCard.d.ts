import * as React from 'react';
export type PluginInfo = {
    id: string;
    name: string;
    version: string;
    status: 'ok' | 'warn' | 'error';
    updateAvailable?: boolean;
    latest?: string;
    description?: string;
};
export declare function PluginCard(props: {
    plugin: PluginInfo;
    onCopy?: ((text: string, key: string) => void) | undefined;
    copiedKey?: (string | null) | undefined;
}): React.JSX.Element;
export declare function PluginGrid(props: {
    plugins: PluginInfo[];
    onCopy?: ((text: string, key: string) => void) | undefined;
    copiedKey?: (string | null) | undefined;
}): React.JSX.Element;
//# sourceMappingURL=PluginCard.d.ts.map