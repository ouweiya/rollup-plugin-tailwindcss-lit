// @ts-nocheck

import postcss, { Plugin as PostcssPlugin } from 'postcss';
import type { Plugin, TransformResult } from 'rollup';
import postcssConfig from 'postcss-load-config';
import discardComments from 'postcss-discard-comments';

import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import { parse } from '@babel/parser';

import safe from 'postcss-safe-parser';
import tailwind from 'tailwindcss';

const traverse = _traverse.default;
const generate = _generate.default;

const pluginTailwindcssLit = (): Plugin => {
    // 转义
    const postcssDoubleEscape: PostcssPlugin = {
        postcssPlugin: 'postcss-double-escape',
        OnceExit(root) {
            root.walkRules(rule => {
                rule.selectors = rule.selectors.map(selector => {
                    return selector.replace(/\\/g, '\\\\');
                });
            });
        },
    };

    // 编译内联tailwind
    const tw = css => {
        const root = postcss().process(css, { parser: safe }).root;
        const applyDirectives = [];

        root.walkAtRules('apply', atRule => {
            applyDirectives.push({ atRule: atRule, parentRule: atRule.parent });
        });

        const promises = applyDirectives.map(({ atRule, parentRule }) => {
            if (parentRule.nodes.length === 1) {
                return postcss([tailwind])
                    .process(parentRule, { from: undefined })
                    .then(result => {
                        parentRule.replaceWith(result.root);
                    });
            } else {
                const newRule = postcss.rule({ selector: parentRule.selector });
                newRule.append(atRule.clone());

                return postcss([tailwind])
                    .process(newRule, { from: undefined })
                    .then(result => {
                        parentRule.parent.insertAfter(parentRule, result.root);
                        atRule.remove();
                    });
            }
        });

        return Promise.all(promises).then(() => {
            return root.toString();
        });
    };

    return {
        name: 'rollup-plugin-tailwindcss-lit',

        async transform(code, id) {
            if (id.includes('node_modules')) return null;
            console.log('transform:', id);

            // 编译内联css
            if (id.endsWith('.ts') || id.endsWith('.js')) {
                const ast = parse(code, { sourceType: 'module' });
                const processNodes = [];

                traverse(ast, {
                    TaggedTemplateExpression(path) {
                        if (path.node.tag.name === 'css') {
                            processNodes.push(path);
                        }
                    },
                });
                console.log('processNodes:', processNodes.length);

                for (let path of processNodes) {
                    const originalCSS = generate(path.node.quasi).code.slice(1, -1);
                    console.log('originalCSS:', originalCSS);
                    const modifiedCSS = await tw(originalCSS);
                    console.log('modifiedCSS', modifiedCSS);
                    path.replaceWithSourceString(`css\`${modifiedCSS}\``);
                }

                const resCode = generate(ast).code;
                console.log('generate:\n', resCode);

                return resCode;
            }

            // 编译css模块
            if (id.endsWith('.css')) {
                const config = await postcssConfig();
                const result = await postcss([
                    discardComments({ removeAll: true }),
                    ...config.plugins,
                    postcssDoubleEscape,
                ]).process(code, { from: id, to: id, map: { inline: false, annotation: false } });

                result.messages.forEach(msg => {
                    if (msg.type === 'dependency') {
                        this.addWatchFile(msg['file']);
                    }
                });

                const csscode = `import { css } from 'lit';\nconst styles = css\`${result.css}\`;\nexport default styles;`;

                return {
                    code: csscode,
                    map: result.map.toString(),
                };
            }

            return null;
        },
    };
};

export default pluginTailwindcssLit;

/* async transform(code, id) {
            if (id.endsWith('.ts')) {
                console.log('id:', id);
                console.log('code', code);
                // this.addWatchFile(id);

                // const ast = parse(code, {
                //     sourceType: 'module',
                //     ecmaVersion: 'latest',
                // });
                // const importDeclaration = {
                //     type: 'ImportDeclaration',
                //     specifiers: [
                //         {
                //             type: 'ImportDefaultSpecifier',
                //             local: { type: 'Identifier', name: 'styles' },
                //         },
                //     ],
                //     source: {
                //         type: 'Literal',
                //         value: 'index.css',
                //     },
                // };
                // ast.body.unshift(importDeclaration);

                // simple(ast, {
                //     AssignmentExpression(node) {
                //         if (
                //             node.left.type === 'MemberExpression' &&
                //             node.left.object.type === 'ThisExpression' &&
                //             node.left.property.name === 'styles' &&
                //             node.right.type === 'ArrayExpression' && // 这一步确保右侧是一个数组
                //             node.right.elements.length === 0 // 这一步确保数组是空的
                //         ) {
                //             node.right.elements.push({ type: 'Identifier', name: 'styles' });
                //         }
                //     },
                // });

                // const modifiedCode = generate(ast);

                // console.log(modifiedCode);

                // return `import styles from 'index.css';\n${code};`;
                // return { code: modifiedCode };
                return null;
            }

            // if (id.endsWith('.css')) {
            //     console.log('CSS 文件');
            //     return `export default ''`;
            // }
            if (id.endsWith('.css')) {
                console.log('CSS 文件加载');
                const code = fs.readFileSync(id, 'utf-8');
                const config = await postcssConfig();
                const result = await postcss([
                    discardComments({ removeAll: true }),
                    ...config.plugins,
                    postcssDoubleEscape,
                ]).process(code, { from: id });

                if (init) {
                    result.messages.forEach(msg => {
                        if (msg.type === 'dependency') {
                            console.log('msg==>', msg['file']);
                            this.addWatchFile(msg['file']);
                            // this.addWatchFile();
                        }
                    });

                    init = false;
                }

                // console.log(this.getWatchFiles());

                const csscode = `import { css } from 'lit';\nconst styles = css\`${result.css}\`;\nexport default styles;`;

                return csscode;
            }

            return null;
        }, */

// map: { inline: false, annotation: false },

// async generateBundle() {
//     console.log('generateBundle');

//     const css = fs.readFileSync(cssPath, 'utf-8');

//     const config = await postcssConfig();
//     const result = await postcss([discardComments({ removeAll: true }), ...config.plugins, postcssDoubleEscape]).process(
//         css,
//         {
//             from: undefined,
//             to: undefined,
//             // map: { inline: false, annotation: false },
//         }
//     );

//     const csscode = `import { css } from 'lit';\nconst styles = css\`${result.css}\`;\nexport default styles;`;

//     this.emitFile({
//         type: 'asset',
//         fileName: 'index.css.js',
//         source: csscode,
//     });
// },

/* async transform(code, id): Promise<TransformResult> {
            if (id.endsWith('.css')) {
                const config = await postcssConfig();
                const result = await postcss([
                    discardComments({ removeAll: true }),
                    ...config.plugins,
                    postcssDoubleEscape,
                ]).process(code, {
                    from: id,
                    to: id,
                    map: { inline: false, annotation: false },
                });

                result.messages.forEach(msg => {
                    if (msg.type === 'dependency') {
                        this.addWatchFile(msg['file']);
                    }
                });

                const csscode = `import { css } from 'lit';\nconst styles = css\`${result.css}\`;\nexport default styles;`;
                return {
                    code: csscode,
                    map: result.map.toString(),
                };
            }
            return null;
        }, */

// ClassDeclaration(node) {
//     console.log('node', node);
//     const staticStyles = node.body.body.find(n => n.type === 'PropertyDefinition' && n.key.name === 'styles');

//     staticStyles.value.elements.push({
//         type: 'Identifier',
//         name: 'styles',
//     });
// },

// options(opts) {
//     if (!isEntryAdded) {
//         if (typeof opts.input === 'string') {
//             opts.input = [opts.input, cssPath];
//         } else if (Array.isArray(opts.input)) {
//             opts.input.push(cssPath);
//         } else if (opts.input) {
//             opts.input.cssModule = cssPath;
//         }
//         isEntryAdded = true;
//         console.log('opts-1\n', opts.input);
//         return opts;
//     }

//     console.log('opts-2\n', opts.input);
//     return null;
// },
// buildStart() {
//     console.log('buildStart');
// },
// async load(id) {
// 会导致所有文件加载并编译，性能问题
// if (id.includes('node_modules')) return null;
// console.log('load:', id);

// if (id.endsWith('.css')) {
//     // console.log('css:', id);
//     const code = fs.readFileSync(id, 'utf-8');
//     const config = await postcssConfig();
//     const result = await postcss([
//         discardComments({ removeAll: true }),
//         ...config.plugins,
//         postcssDoubleEscape,
//     ]).process(code, { from: id });

//     const csscode = `import { css } from 'lit';\nconst styles = css\`${result.css}\`;\nexport default styles;`;

//     return csscode;
// }
// if (id.endsWith('.ts')) {
//     console.log('ts:', id);
//     const code = fs.readFileSync(id, 'utf-8');
//     // console.log('code==>\n', code);
// }

// return null;
// },
