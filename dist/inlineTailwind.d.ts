import type { TransformPluginContext } from 'rollup';
import type { Result } from 'postcss-load-config';
declare const compileTailwind: (config: Result, css: string, context: {
    thisRef: TransformPluginContext;
    position: any;
}) => Promise<string>;
export default compileTailwind;
