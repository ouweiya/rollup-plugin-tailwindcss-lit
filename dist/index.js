import postcss from 'postcss';
import postcssConfig from 'postcss-load-config';
import { createFilter } from '@rollup/pluginutils';
const pluginTailwindcssLit = () => {
    const filter = createFilter(['**/*.css']);
    return {
        name: 'rollup-plugin-tailwindcss-lit',
        async transform(code, id) {
            if (filter(id)) {
                const config = await postcssConfig();
                const result = await postcss(config.plugins).process(code, {
                    from: id,
                    to: id,
                    map: { inline: false, annotation: false },
                });
                result.messages.forEach(msg => {
                    if (msg.type === 'dependency') {
                        this.addWatchFile(msg['file']);
                    }
                });
                const csscode = `import { css } from 'lit';\nexport default css\`\n${result.css}\``;
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