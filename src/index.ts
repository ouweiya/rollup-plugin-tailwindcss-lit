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
    // Escape
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

    // Compile inline tailwind
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
            // Extract template content
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
                // console.log('processNodes:', processNodes.length);

                for (let path of processNodes) {
                    const originalCSS = generate(path.node.quasi).code.slice(1, -1);
                    const modifiedCSS = await tw(originalCSS);
                    path.replaceWithSourceString(`css\`${modifiedCSS}\``);
                }

                const output = generate(ast, { sourceMaps: true, sourceFileName: id });

                return { code: output.code, map: output.map };
            }

            // Compile CSS module
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

                return { code: csscode, map: result.map.toJSON() };
            }

            return null;
        },
    };
};

export default pluginTailwindcssLit;
