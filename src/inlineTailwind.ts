import postcss from 'postcss';
import type { TransformPluginContext } from 'rollup';
import type { Result } from 'postcss-load-config';
import discardComments from 'postcss-discard-comments';
import safe from 'postcss-safe-parser';
import postcssDoubleEscape from './escape.js';

// Compile inline tailwind
const compileTailwind = (config: Result, css: string, context: { thisRef: TransformPluginContext; position: any }) => {
    console.log('css', css);
    const root = postcss().process(css, { parser: safe }).root;
    const applyDirectives = [];

    root.walkAtRules('apply', atRule => {
        applyDirectives.push({ atRule: atRule, parentRule: atRule.parent });
    });
    console.log('applyDirectives', applyDirectives.length);
    if (!applyDirectives.length) return null;
    console.log('编译@apply');
    const promises = applyDirectives.reverse().map(({ atRule, parentRule }) => {
        if (!parentRule.selector) {
            context.thisRef.warn(`Missing selector!`, { line: context.position.line, column: context.position.column });
            return;
        }

        if (parentRule.nodes.length === 1) {
            return postcss([discardComments({ removeAll: true }), ...config.plugins, postcssDoubleEscape])
                .process(parentRule, { from: undefined })
                .then(result => {
                    parentRule.replaceWith(result.root);
                });
        } else {
            const newRule = postcss.rule({ selector: parentRule.selector });
            newRule.append(atRule.clone());
            atRule.remove();
            return postcss([discardComments({ removeAll: true }), ...config.plugins, postcssDoubleEscape])
                .process(newRule, { from: undefined })
                .then(result => {
                    if (!/\\\\/.test(parentRule.selector)) {
                        parentRule.selector = parentRule.selector.replace(/\\/g, '\\\\');
                    }
                    parentRule.parent.insertAfter(parentRule, result.root);
                });
        }
    });

    return Promise.all(promises).then(() => root.toString());
};

export default compileTailwind;
