import postcss, { Plugin as PostcssPlugin } from 'postcss';
import postcssConfig from 'postcss-load-config';
import discardComments from 'postcss-discard-comments';
import { parse } from '@babel/parser';
import babelTraverse from '@babel/traverse';
import babelGenerator from '@babel/generator';
import type traverseType from '@babel/traverse';
import type generatorType from '@babel/generator';
import type { TransformPluginContext } from 'rollup';
import safe from 'postcss-safe-parser';

interface traverseInterface {
    default?: typeof traverseType;
}
interface generatorInterface {
    default?: typeof generatorType;
}
interface MyModifiedRawSourceMap {
    version: number;
    sources: string[];
    names: string[];
    sourcesContent?: string[];
    mappings: string;
}

const traverse = (babelTraverse as traverseInterface).default;
const generate = (babelGenerator as generatorInterface).default;

const pluginTailwindcssLit = async (/* fake?: any */) => {
    const config = await postcssConfig();

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
    const compileTailwind = (css: string, context: { thisRef: TransformPluginContext; position: any }) => {
        const root = postcss().process(css, { parser: safe }).root;
        const applyDirectives = [];

        root.walkAtRules('apply', atRule => {
            applyDirectives.push({ atRule: atRule, parentRule: atRule.parent });
        });

        if (!applyDirectives.length) {
            // fake('没有@apply时返回');
            return null;
        }

        // fake('有@apply');

        const promises = applyDirectives.reverse().map(({ atRule, parentRule }) => {
            if (!parentRule.selector) {
                // fake('缺少选择器');
                context.thisRef.warn(`Missing selector!`, { line: context.position.line, column: context.position.column });
                return;
            }
            // fake('记录@apply数量');
            if (parentRule.nodes.length === 1) {
                // fake('声明中只有@apply时替换');
                return postcss([discardComments({ removeAll: true }), ...config.plugins, postcssDoubleEscape])
                    .process(parentRule, { from: undefined })
                    .then(result => {
                        parentRule.replaceWith(result.root);
                    });
            } else {
                // fake('声明中有其它样式时插入');
                const newRule = postcss.rule({ selector: parentRule.selector });
                newRule.append(atRule.clone());
                atRule.remove();
                return postcss([discardComments({ removeAll: true }), ...config.plugins, postcssDoubleEscape])
                    .process(newRule, { from: undefined })
                    .then(result => {
                        if (!/\\\\/.test(parentRule.selector)) {
                            // fake('斜杠转义');
                            parentRule.selector = parentRule.selector.replace(/\\/g, '\\\\');
                        }
                        parentRule.parent.insertAfter(parentRule, result.root);
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
                // fake('js,ts分支');
                const ast = parse(code, { sourceType: 'module' });
                const taggedTemplate = [];

                traverse(ast, {
                    TaggedTemplateExpression(path: any) {
                        if (path.node.tag.name === 'css') {
                            taggedTemplate.push(path);
                            // fake('记录标签模板数量');
                        }
                    },
                });

                if (!taggedTemplate.length) {
                    // fake('没有标签模板');
                    return null;
                }
                // fake('有标签模板');

                const twPromises = taggedTemplate.map(async path => {
                    const originalCSS = generate(path.node.quasi).code.slice(1, -1);
                    const modifiedCSS = await compileTailwind(originalCSS, {
                        thisRef: this,
                        position: path.node.quasi.loc.start,
                    });

                    if (modifiedCSS) {
                        // fake('编译CSS为真');
                        path.replaceWithSourceString(`css\`${modifiedCSS}\``);
                    }

                    return !!modifiedCSS;
                });

                const res = await Promise.all(twPromises);
                const allFalse = res.every(v => !Boolean(v));

                if (allFalse) {
                    // fake('全部标签模板不包含@apply时返回');
                    return null;
                }

                // fake('所有标签模板中包含@apply');

                const output = generate(ast, { sourceMaps: true, sourceFileName: id });

                return { code: output.code, map: output.map };
            } else if (id.endsWith('.css')) {
                // fake('css分支');
                // Compile CSS module
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

                return { code: csscode, map: result.map.toJSON() as any as MyModifiedRawSourceMap };
            }

            return null;
        },
    };
};

export default pluginTailwindcssLit;
