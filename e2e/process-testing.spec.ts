import { rollup } from 'rollup';
import { test, expect } from '@playwright/test';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import tailwindcss from '../src/index';
import typescript from '@rollup/plugin-typescript';
import { writeFile } from 'node:fs/promises';
import sinon from 'sinon';

const conent = txt => `
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
    static styles = ${txt};
    protected render() {
        return html\`<p class='text-blue-600'>I am green!</p>\`;
    }
}
`;

test.describe('流程测试', () => {
    test('css不在数组中', async () => {
        const txt = `css\`
            p {
                color: green;
                @apply bg-red-200;
            }\`
        `;

        await writeFile('./e2e/index.ts', conent(txt));

        const bundle = await rollup({
            input: './e2e/index.ts',
            plugins: [
                nodeResolve({ exportConditions: ['development'] }),
                typescript({ compilerOptions: { sourceMap: false, inlineSources: false } }),
                tailwindcss(),
            ],
        });

        const { output } = await bundle.generate({ format: 'es', preserveModules: true });
        const code = output[0].code;
        console.log(code);
    });
});
