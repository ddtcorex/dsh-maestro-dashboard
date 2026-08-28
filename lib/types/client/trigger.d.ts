import * as React from 'react';
export type HealthStatus = 'ok' | 'warn' | 'error';
export declare function MaestroLogo(props: {
    size?: number;
}): React.JSX.Element;
export declare function MaestroTrigger(props: {
    health?: HealthStatus;
    collapsed?: boolean;
    wide?: boolean;
    onClick?: () => void;
}): React.JSX.Element;
//# sourceMappingURL=trigger.d.ts.map