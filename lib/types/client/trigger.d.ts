import * as React from 'react';
import { MaestroMark } from './components/BrandMark.tsx';
export declare const MaestroLogo: typeof MaestroMark;
export type HealthStatus = 'ok' | 'warn' | 'error';
export declare function MaestroTrigger(props: {
    health?: HealthStatus;
    collapsed?: boolean;
    wide?: boolean;
    onClick?: () => void;
}): React.JSX.Element;
//# sourceMappingURL=trigger.d.ts.map