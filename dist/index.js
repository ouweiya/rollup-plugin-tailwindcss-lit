import postcss from 'postcss';
import postcssConfig from 'postcss-load-config';
import { createFilter } from '@rollup/pluginutils';
import discardComments from 'postcss-discard-comments';
const postcssDoubleEscape = {
    postcssPlugin: 'postcss-double-escape',
    Once(root) {
        root.walkRules(rule => {
            rule.selectors = rule.selectors.map(selector => {
                return selector.replace(/\\:/g, '\\\\:');
            });
        });
    },
};
const pluginTailwindcssLit = () => {
    const filter = createFilter(['**/*.css']);
    return {
        name: 'rollup-plugin-tailwindcss-lit',
        async transform(code, id) {
            if (filter(id)) {
                const config = await postcssConfig();
                const result = await postcss([discardComments({ removeAll: true }), ...config.plugins, postcssDoubleEscape]).process(code, {
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
        },
    };
};
export default pluginTailwindcssLit;
//# sourceMappingURL=index.js.map