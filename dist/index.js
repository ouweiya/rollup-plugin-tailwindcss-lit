import postcss from 'postcss';
import postcssConfig from 'postcss-load-config';
import discardComments from 'postcss-discard-comments';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import { parse } from '@babel/parser';
import safe from 'postcss-safe-parser';
const traverse = _traverse.default;
const generate = _generate.default;
const pluginTailwindcssLit = async () => {
    const config = await postcssConfig();
    const postcssDoubleEscape = {
        postcssPlugin: 'postcss-double-escape',
        OnceExit(root) {
            root.walkRules(rule => {
                rule.selectors = rule.selectors.map(selector => {
                    console.log('selector', selector);
                    return selector.replace(/\\/g, '\\\\');
                });
            });
        },
    };
    const tw = css => {
        const root = postcss().process(css, { parser: safe }).root;
        const applyDirectives = [];
        root.walkAtRules('apply', atRule => {
            applyDirectives.push({ atRule: atRule, parentRule: atRule.parent });
        });
        const promises = applyDirectives.map(({ atRule, parentRule }) => {
            if (parentRule.nodes.length === 1) {
                console.log("条件一");
                return postcss([discardComments({ removeAll: true }), ...config.plugins,])
                    .process(parentRule, { from: undefined })
                    .then(result => {
                    parentRule.replaceWith(result.root);
                });
            }
            else {
                console.log("条件二");
                const newRule = postcss.rule({ selector: parentRule.selector });
                newRule.append(atRule.clone());
                return postcss([discardComments({ removeAll: true }), ...config.plugins,])
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
            if (id.includes('node_modules'))
                return null;
            console.log('transform:', id);
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
                    const modifiedCSS = await tw(originalCSS);
                    path.replaceWithSourceString(`css\`${modifiedCSS}\``);
                }
                const output = generate(ast, { sourceMaps: true, sourceFileName: id });
                return { code: output.code, map: output.map };
            }
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
//# sourceMappingURL=index.js.map