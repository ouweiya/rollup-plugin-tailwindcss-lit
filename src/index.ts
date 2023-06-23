import postcss, { Plugin as PostcssPlugin } from 'postcss';
import type { Plugin, TransformResult } from 'rollup';
import postcssConfig from 'postcss-load-config';
import discardComments from 'postcss-discard-comments';

const postcssDoubleEscape: PostcssPlugin = {
    postcssPlugin: 'postcss-double-escape',
    Once(root) {
        root.walkRules(rule => {
            rule.selectors = rule.selectors.map(selector => {
                return selector.replace(/\\/g, '\\\\');
            });
        });
    },
};

const pluginTailwindcssLit = (): Plugin => {
    return {
        name: 'rollup-plugin-tailwindcss-lit',
        async transform(code, id): Promise<TransformResult> {
            if (/\.css$/.test(id)) {
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
        },
    };
};

export default pluginTailwindcssLit;
