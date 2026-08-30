import * as React from 'react';
export type Kpi = {
    id: string;
    label: string;
    value: string;
    sub?: string;
    status: 'ok' | 'warn' | 'error';
    icon?: React.ReactNode;
};
export declare function HeroKpi(props: {
    kpis: Kpi[];
}): React.JSX.Element;
//# sourceMappingURL=HeroKpi.d.ts.map