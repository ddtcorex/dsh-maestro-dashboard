import * as React from 'react';
type TabId = 'overview' | 'plugins' | 'usage' | 'reviews';
export declare function Overlay(props: {
    onClose?: () => void;
    children?: React.ReactNode;
    overview?: any;
    plugins?: any;
    usage?: any;
    reviews?: any;
    usageRange?: '7d' | '30d';
    onUsageRangeChange?: (r: '7d' | '30d') => void;
    initialTab?: TabId;
}): React.JSX.Element;
export {};
//# sourceMappingURL=overlay.d.ts.map