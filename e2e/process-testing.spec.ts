import { rollup } from 'rollup';
import { test, expect } from '@playwright/test';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import tailwindcss from '../src/index';
import typescript from '@rollup/plugin-typescript';
import { writeFile } from 'node:fs/promises';
import sinon from 'sinon';

const conent = (txt: string) => `
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import style from './index.css';

@customElement('my-element')
export class MyElement extends LitElement {
    static styles = [style, ${txt}];
    protected render() {
        return html\`<p class='text-blue-600'>I am green!</p>\`;
    }
}
`;

function getCallCountWithArg(fake, arg) {
    return fake.getCalls().filter(call => call.calledWith(arg)).length;
}

test.describe('流程测试', () => {
    let fake;
    test.beforeEach(() => {
        fake = sinon.fake();
    });

    test('有css标签模板', async () => {
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
                tailwindcss(fake),
            ],
        });

        const { output } = await bundle.generate({ format: 'es', preserveModules: true });
        const code = output[0].code;
        console.log(code);

        expect(fake.calledWith('js,ts分支')).toBe(true);
        expect(fake.calledWith('css分支')).toBe(true);
        expect(fake.calledWith('有标签模板')).toBe(true);
        expect(fake.calledWith('有@apply')).toBe(true);
        expect(getCallCountWithArg(fake, '记录@apply数量')).toBe(1);
        expect(fake.calledWith('声明中有其它样式时插入')).toBe(true);
        expect(fake.calledWith('斜杠转义')).toBe(true);
        expect(fake.calledWith('编译CSS为真')).toBe(true);
        expect(fake.calledWith('所有标签模板中包含@apply')).toBe(true);
        expect(getCallCountWithArg(fake, '记录标签模板数量')).toBe(1);
    });

    test('没有css标签模板', async () => {
        const txt = ``;

        await writeFile('./e2e/index.ts', conent(txt));

        const bundle = await rollup({
            input: './e2e/index.ts',
            plugins: [
                nodeResolve({ exportConditions: ['development'] }),
                typescript({ compilerOptions: { sourceMap: false, inlineSources: false } }),
                tailwindcss(fake),
            ],
        });

        const { output } = await bundle.generate({ format: 'es', preserveModules: true });
        const code = output[0].code;
        console.log(code);

        expect(fake.calledWith('js,ts分支')).toBe(true);
        expect(fake.calledWith('css分支')).toBe(true);
        expect(getCallCountWithArg(fake, '记录标签模板数量')).toBe(0);
        expect(fake.calledWith('没有标签模板')).toBe(true);
        expect(fake.calledWith('有标签模板')).toBe(false);
    });

    test('没有@apply', async () => {
        const txt = `
        css\`
        p {
            color: green;
        }\`,
        css\`
        h3 {
            color: red;
        }\`
        `;

        await writeFile('./e2e/index.ts', conent(txt));

        const bundle = await rollup({
            input: './e2e/index.ts',
            plugins: [
                nodeResolve({ exportConditions: ['development'] }),
                typescript({ compilerOptions: { sourceMap: false, inlineSources: false } }),
                tailwindcss(fake),
            ],
        });

        const { output } = await bundle.generate({ format: 'es', preserveModules: true });
        const code = output[0].code;
        console.log(code);

        expect(fake.calledWith('js,ts分支')).toBe(true);
        expect(fake.calledWith('css分支')).toBe(true);
        expect(fake.calledWith('有标签模板')).toBe(true);
        expect(getCallCountWithArg(fake, '记录标签模板数量')).toBe(2);
        expect(fake.calledWith('没有@apply时返回')).toBe(true);
        expect(getCallCountWithArg(fake, '记录@apply数量')).toBe(0);
        expect(fake.calledWith('编译CSS为真')).toBe(false);
        expect(fake.calledWith('全部标签模板不包含@apply时返回')).toBe(true);
    });

    test('一个有,一个没有@apply', async () => {
        const txt = `
        css\`
        p {
            color: green;
        }\`,
        css\`
        h3 {
            color: red;
            @apply bg-red-500;
        }\`
        `;

        await writeFile('./e2e/index.ts', conent(txt));

        const bundle = await rollup({
            input: './e2e/index.ts',
            plugins: [
                nodeResolve({ exportConditions: ['development'] }),
                typescript({ compilerOptions: { sourceMap: false, inlineSources: false } }),
                tailwindcss(fake),
            ],
        });

        const { output } = await bundle.generate({ format: 'es', preserveModules: true });
        const code = output[0].code;
        console.log(code);

        expect(fake.calledWith('js,ts分支')).toBe(true);
        expect(fake.calledWith('css分支')).toBe(true);
        expect(fake.calledWith('有标签模板')).toBe(true);
        expect(fake.calledWith('有@apply')).toBe(true);
        expect(getCallCountWithArg(fake, '记录标签模板数量')).toBe(2);
        expect(fake.calledWith('声明中有其它样式时插入')).toBe(true);
        expect(fake.calledWith('斜杠转义')).toBe(true);
        expect(fake.calledWith('编译CSS为真')).toBe(true);
        expect(fake.calledWith('所有标签模板中包含@apply')).toBe(true);
        expect(getCallCountWithArg(fake, '记录@apply数量')).toBe(1);
        expect(fake.calledWith('所有标签模板中包含@apply')).toBe(true);
    });


    test('当一个声明中只有@apply时', async () => {
        const txt = `
        css\`
        p {
            color: green;
            @apply bg-pink-500;
        }\`,
        css\`
        h3 {
            @apply bg-red-500;
        }\`
        `;

        await writeFile('./e2e/index.ts', conent(txt));

        const bundle = await rollup({
            input: './e2e/index.ts',
            plugins: [
                nodeResolve({ exportConditions: ['development'] }),
                typescript({ compilerOptions: { sourceMap: false, inlineSources: false } }),
                tailwindcss(fake),
            ],
        });

        const { output } = await bundle.generate({ format: 'es', preserveModules: true });
        const code = output[0].code;
        console.log(code);

        expect(fake.calledWith('js,ts分支')).toBe(true);
        expect(fake.calledWith('css分支')).toBe(true);

        expect(fake.calledWith('有@apply')).toBe(true);
        expect(getCallCountWithArg(fake, '记录标签模板数量')).toBe(2);
        expect(fake.calledWith('声明中有其它样式时插入')).toBe(true);
        expect(fake.calledWith('声明中只有@apply时替换')).toBe(true);
        expect(fake.calledWith('编译CSS为真')).toBe(true);
        expect(getCallCountWithArg(fake, '记录@apply数量')).toBe(2);
        expect(fake.calledWith('所有标签模板中包含@apply')).toBe(true);
    });

    test('缺少选择器', async () => {
        const txt = `
        css\`
        {
            color: green;
            @apply bg-pink-500;
        }\`,
        css\`
        h3 {
            @apply bg-red-500;
        }\`
        `;

        await writeFile('./e2e/index.ts', conent(txt));

        const bundle = await rollup({
            input: './e2e/index.ts',
            plugins: [
                nodeResolve({ exportConditions: ['development'] }),
                typescript({ compilerOptions: { sourceMap: false, inlineSources: false } }),
                tailwindcss(fake),
            ],
        });

        const { output } = await bundle.generate({ format: 'es', preserveModules: true });
        const code = output[0].code;
        console.log(code);

        // expect(fake.calledWith('js,ts分支')).toBe(true);
        // expect(fake.calledWith('css分支')).toBe(true);

        expect(fake.calledWith('缺少选择器')).toBe(true);
        // expect(getCallCountWithArg(fake, '记录标签模板数量')).toBe(2);
        // expect(fake.calledWith('声明中有其它样式时插入')).toBe(true);
        // expect(fake.calledWith('声明中只有@apply时替换')).toBe(true);
        // expect(fake.calledWith('编译CSS为真')).toBe(true);
        // expect(getCallCountWithArg(fake, '记录@apply数量')).toBe(2);
        // expect(fake.calledWith('所有标签模板中包含@apply')).toBe(true);
    });


});
