import postcss from 'postcss';
import postcssConfig from 'postcss-load-config';
import discardComments from 'postcss-discard-comments';
import { parse } from '@babel/parser';
import babelTraverse from '@babel/traverse';
import babelGenerator from '@babel/generator';
import type traverseType from '@babel/traverse';
import type generatorType from '@babel/generator';

import postcssDoubleEscape from './escape.js';
import compileTailwind from './compileTailwind.js';

interface traverseInterface {
    default?: typeof traverseType;
}
interface generatorInterface {
    default?: typeof generatorType;
}

const traverse = (babelTraverse as traverseInterface).default;
const generate = (babelGenerator as generatorInterface).default;

const pluginTailwindcssLit = async () => {
    const config = await postcssConfig();

    return {
        name: 'rollup-plugin-tailwindcss-lit',
        async transform(code, id) {
            if (id.includes('node_modules')) return null;

            // Extract template content
            if (id.endsWith('.ts') || id.endsWith('.js')) {
                const ast = parse(code, { sourceType: 'module' });
                const taggedTemplate = [];

                traverse(ast, {
                    TaggedTemplateExpression(path: any) {
                        if (path.node.tag.name === 'css') taggedTemplate.push(path);
                    },
                });

                console.log('processNodes', taggedTemplate.length);
                if (!taggedTemplate.length) return null;
                console.log('编译css');

                const twPromises = taggedTemplate.map(async path => {
                    const originalCSS = generate(path.node.quasi).code.slice(1, -1);
                    const modifiedCSS = await compileTailwind(config, originalCSS, {
                        thisRef: this,
                        position: path.node.quasi.loc.start,
                    });
                    console.log('modifiedCSS', modifiedCSS);
                    if (modifiedCSS) path.replaceWithSourceString(`css\`${modifiedCSS}\``);
                    return !!modifiedCSS;
                });

                const res = await Promise.all(twPromises);
                const allTruthy = res.every(v => !Boolean(v));
                console.log('res', res);
                console.log('allTruthy', allTruthy);
                if (allTruthy) return null;

                const output = generate(ast, { sourceMaps: true, sourceFileName: id });
                console.log('output');

                return { code: output.code, map: output.map };
            } else if (id.endsWith('.css')) {
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

                return { code: csscode, map: result.map.toJSON() };
            }

            return null;
        },
    };
};

export default pluginTailwindcssLit;
