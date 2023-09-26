import postcss, { Plugin as PostcssPlugin } from 'postcss';
import type { Plugin, TransformPluginContext } from 'rollup';
import postcssConfig from 'postcss-load-config';
import discardComments from 'postcss-discard-comments';

import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import { parse } from '@babel/parser';

import safe from 'postcss-safe-parser';

const traverse = _traverse.default;
const generate = _generate.default;

const pluginTailwindcssLit = async (): Promise<Plugin<any>> => {
    const config = await postcssConfig();
    // Escape
    const postcssDoubleEscape: PostcssPlugin = {
        postcssPlugin: 'postcss-double-escape',
        Rule(rule) {
            if (!Array.isArray(rule.selectors)) return;
            rule.selectors = rule.selectors.map(selector => {
                if (typeof selector !== 'string') return selector;
                return selector.replace(/\\/g, '\\\\');
            });
        },
    };

    // Compile inline tailwind
    const tw = (css: string, context: { thisRef: TransformPluginContext; position: any }) => {
        const root = postcss().process(css, { parser: safe }).root;
        const applyDirectives = [];

        root.walkAtRules('apply', atRule => {
            applyDirectives.push({ atRule: atRule, parentRule: atRule.parent });
        });

        const promises = applyDirectives.map(({ atRule, parentRule }) => {
            if (!parentRule.selector) {
                context.thisRef.warn(`Missing selector!`, { line: context.position.line, column: context.position.column });
                return;
            }
            parentRule.selector = parentRule.selector.replace(/\\/g, '\\\\');
            if (parentRule.nodes.length === 1) {
                return postcss([discardComments({ removeAll: true }), ...config.plugins])
                    .process(parentRule, { from: undefined })
                    .then(result => {
                        parentRule.replaceWith(result.root);
                    });
            } else {
                const newRule = postcss.rule({ selector: parentRule.selector });
                newRule.append(atRule.clone());

                return postcss([discardComments({ removeAll: true }), ...config.plugins])
                    .process(newRule, { from: undefined })
                    .then(result => {
                        parentRule.parent.insertAfter(parentRule, result.root);
                        atRule.remove();
                    });
            }
        });

        return Promise.all(promises).then(() => root.toString());
    };

    return {
        name: 'rollup-plugin-tailwindcss-lit',
        async transform(code, id) {
            if (id.includes('node_modules')) return null;

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

                for (let path of processNodes) {
                    const originalCSS = generate(path.node.quasi).code.slice(1, -1);
                    const modifiedCSS = await tw(originalCSS, { thisRef: this, position: path.node.quasi.loc.start });
                    path.replaceWithSourceString(`css\`${modifiedCSS}\``);
                }

                const output = generate(ast, { sourceMaps: true, sourceFileName: id });

                return { code: output.code, map: output.map };
            }

            // Compile CSS module
            if (id.endsWith('.css')) {
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
