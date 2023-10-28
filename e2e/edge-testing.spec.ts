import { rollup } from 'rollup';
import { test, expect } from '@playwright/test';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import tailwindcss from '../src/index';
import typescript from '@rollup/plugin-typescript';
import { writeFile } from 'node:fs/promises';

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

test.describe('边缘测试', () => {
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

    test('一个css中包含一个@apply', async () => {
        const txt = `[css\`
            p {
                color: green;
                @apply bg-pink-200;
            }\`
        ]`;

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

        // expect(code).toContain('expected-output');
    });

    test('多个css标签', async () => {
        const txt = `[css\`
            p {
                color: green;
                @apply bg-pink-200;
            }\`,
            css\`
            p {
                color: red;
                @apply bg-green-500;
            }\`
        ]`;

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

    test('多个css标签, 其中一个没有@apply', async () => {
        const txt = `[css\`
            p {
                color: green;

            }\`,
            css\`
            p {
                color: red;
                @apply bg-pink-200;
            }\`
        ]`;

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

    test('多个css标签, 全部没有@apply', async () => {
        const txt = `[css\`
            p {
                color: green;

            }\`,
            css\`
            p {
                color: red;
            }\`
        ]`;

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

    test('没有css标签', async () => {
        const txt = `[]`;
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

    test('css声明中包含多个@apply', async () => {
        const txt = `[css\`
            p {
                color: green;
                @apply bg-red-200;
                @apply bg-red-400;
            }
            h2 {
                color: green;
                @apply bg-red-200;
            }
            \`,
            css\`
            p {
                color: red;
                @apply bg-blue-200;
            }
            h3 {
                color: green;
                @apply bg-pink-200;
            }
            \`
        ]`;

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

    test('css声明中只包含@apply', async () => {
        const txt = `[css\`
            p {
                @apply bg-red-400;
            }
            h2 {
                @apply bg-red-200;
            }
            \`,
            css\`
            div {
                @apply bg-blue-200;
            }
            h3 {
                @apply bg-pink-200;
            }
            \`
        ]`;

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

    test('@apply中包含变量', async () => {
        const txt = `
        import { LitElement, html, css } from 'lit';
        import { customElement } from 'lit/decorators.js';

        const bg = 'bg-red-400';
        @customElement('my-element')
        export class MyElement extends LitElement {
            static styles = [css\`
                p {
                    color: green;
                    @apply \${bg};
                }
                \`,
                css\`
                div {
                    color: pink;
                    @apply \${bg};
                }
                h3 {
                    @apply bg-pink-200;
                }
                \`
            ];
            render() {
                return html\`<p class='text-blue-600'>I am green!</p>\`;
            }
        }
        `;

        await writeFile('./e2e/index.ts', txt);

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

    test('css声明不包含选择器', async () => {
        const txt = `[css\`
            p {
                @apply bg-red-400;
            }
            {
                @apply bg-red-200;
            }
            \`,
            css\`
            div {
                @apply bg-blue-200;
            }
            h3 {
                @apply bg-pink-200;
            }
            \`
        ]`;

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
