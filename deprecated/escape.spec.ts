import { test, expect } from '@playwright/test';
import postcss from 'postcss';
import postcssConfig from 'postcss-load-config';
import discardComments from 'postcss-discard-comments';
import { readFile } from 'fs/promises';
import postcssDoubleEscape from '../src/escape';

test.describe('转义测试', () => {
    test('测试斜杠转义', async () => {
        const config = await postcssConfig();
        console.log('plugins:', config.plugins.length);
        const code = await readFile('e2e/index.css', 'utf8');

        const result = await postcss([discardComments({ removeAll: true }), ...config.plugins, postcssDoubleEscape]).process(
            code,
            {
                from: undefined,
                map: { inline: false, annotation: false },
            }
        );

        const regex = /(?<!\\)\\(?!\\)/g;
        const incorrectEscapes = result.css.match(regex);

        expect(incorrectEscapes).toBeNull();
    });
});

// let originalEnv;

// test.beforeEach(() => {
//     originalEnv = process.env.NODE_ENV;
// });

// test.afterEach(() => {
//     process.env.NODE_ENV = originalEnv;
// });
// process.env.NODE_ENV = 'build';

// test('ww', () => {
//     const output = `
//     .w-\\[200px\\] {
//         width: 200px
//     }
//     .bg-red-500 {
//         --tw-bg-opacity: 1;
//         background-color: rgb(239 68 68 / var(--tw-bg-opacity))
//     }
//     .\\[aaa\\:500px\\] {
//         aaa: 500px
//     }
//     .hover\\:w-\\[300px\\]:hover {
//         width: 300px
//     }
//     .focus\\:\\[bbb\\:300px\\]:focus {
//         bbb: 300px
//     }
//     `;
//     writeFile('output-2.txt', output);
//     console.log('output', output);
// });
