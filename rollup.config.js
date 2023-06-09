import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
// import type { RollupOptions } from 'rollup';
import commonjs from '@rollup/plugin-commonjs';
import { defineConfig } from 'rollup';

const config = defineConfig({
  input: ['src/index.ts'],
  output: {
    format: 'es',
    dir: 'dist',
    // preserveModules: true,
    sourcemap: true,
    // chunkFileNames: 'chunks/[name].js',
  },
  watch: {
    clearScreen: false,
  },
  // onwarn(warning, warn) {
  //   if (warning.code === 'CIRCULAR_DEPENDENCY') {
  //     return;
  //   }
  //   warn(warning);
  // },
  plugins: [typescript(), nodeResolve(), commonjs()],
});

export default config;
