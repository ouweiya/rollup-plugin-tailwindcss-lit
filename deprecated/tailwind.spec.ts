import { test, expect } from '@playwright/test';
import postcss from 'postcss';
import postcssConfig from 'postcss-load-config';
import safe from 'postcss-safe-parser';
import discardComments from 'postcss-discard-comments';
// import compileTailwind from '../src/compileTailwind';
import postcssDoubleEscape from '../src/escape';




test('a333', async () => {
    const config = await postcssConfig();

    const css = ``;
    const root = postcss().process(css, { parser: safe }).root;
    const applyDirectives: any[] = [];

    root.walkAtRules('apply', atRule => {
        applyDirectives.push({ atRule, parentRule: atRule.parent });
    });

    // 没有捕获到apply时返回
    // if (!applyDirectives.length) return null;

    const promises = applyDirectives.reverse().map(({ atRule, parentRule }) => {
        // 没有选择器时返回
        if (!parentRule.selector) return;
        // 没有其它选择器时直接替换
        if (parentRule.nodes.length === 1) {
            return postcss([discardComments({ removeAll: true }), ...config.plugins, postcssDoubleEscape])
                .process(parentRule, { from: undefined })
                .then(result => {
                    parentRule.replaceWith(result.root);
                });
        } else {
            // 有其它选择器时插值
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

    await Promise.all(promises).then(() => root.toString());
});
