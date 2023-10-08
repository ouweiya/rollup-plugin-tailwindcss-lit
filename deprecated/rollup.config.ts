import type { RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';

const config: RollupOptions = {
    input: 'src/index.ts',
    output: {
        dir: 'dist',
        format: 'es',
    },
    plugins: [nodeResolve(), typescript(), commonjs(), json()],
};

export default config;
