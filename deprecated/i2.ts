import postcss from 'postcss';
import postcssConfig from 'postcss-load-config';
import discardComments from 'postcss-discard-comments';
import tailwindcss from 'tailwindcss';
import path from 'node:path';
import fs from 'fs';

const postcssDoubleEscape = {
    postcssPlugin: 'postcss-double-escape',
    OnceExit(root) {
        root.walkRules(rule => {
            rule.selectors = rule.selectors.map(selector => {
                return selector.replace(/\\/g, '\\\\');
            });
        });
    },
};

const pluginTailwindcssLit = () => {
    const cssFileAll = path.resolve('src/index.css');
    const cssFilePath = 'src/index.css';

    return {
        name: 'rollup-plugin-tailwindcss-lit',
        // buildStart() {
        //     this.addWatchFile(cssFilePath);
        // },
        async load(id) {
            if (!id.endsWith('.css')) return null;
            console.log('load:id');
        },
        async generateBundle() {
            console.log("generateBundle");
        },
        async transform(code, id) {
            if (id.includes('node_modules')) return null;

            // if (!id.endsWith('.js') && !id.endsWith('.css') && !id.endsWith('.ts')) return null;
            // console.log('transform0:', cssFilePath);
            // console.log('id', id);
            // console.log('cssFileAll', cssFileAll);
            // if (id !== cssFileAll) return;
            // console.log('id==>', id);

            // const css = fs.readFileSync(path.resolve('src/index.css'), 'utf-8');
            // console.log('css:', css);
            // D:\\Rollup\\youtube-dual-subtitles-v3\\src\\index.css
        if (id.endsWith('.css')) {
            console.log('id:', id);
            const config = await postcssConfig();
            const result = await postcss([discardComments({ removeAll: true }), ...config.plugins, postcssDoubleEscape]).process(
                code,
                {
                    from: id,
                    to: id,
                    map: { inline: false, annotation: false },
                }
            );
            // result.messages.forEach(msg => {
            //     console.log('msg', msg);
            //     if (msg.type === 'dependency') {
            //         this.addWatchFile(msg['file']);
            //     }
            // });
            // D:\Rollup\youtube-dual-subtitles-v3\src\index.css
            const csscode = `import { css } from 'lit';\nconst styles = css\`${result.css}\`;\nexport default styles;`;
            return {
                code: csscode,
                map: result.map.toString(),
            };
        }
        },
        /* else if (id.endsWith('.js') || id.endsWith('.ts')) {
                const cssRegExp = /css\s+`([^`]*)`/g;

                let match;
                let transformedCode = code;

                console.log('code==>\n\n', code);
                while ((match = cssRegExp.exec(code)) !== null) {
                  const [fullMatch, cssContent] = match;

                  // 使用postcss处理每个匹配到的css模板字符串
                  const result = await postcss([tailwindcss]).process(cssContent, { from: undefined });
                  transformedCode = transformedCode.replace(fullMatch, `css\`${result.css}\``);
                  console.log('transformedCode==>\n\n', transformedCode);
                }

                return {
                    code: transformedCode,
                    map: null
                };
            } */
    };
};

export default pluginTailwindcssLit;
//# sourceMappingURL=index.js.map

// return null;
