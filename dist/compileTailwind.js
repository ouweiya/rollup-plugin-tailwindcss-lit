import postcss from 'postcss';
import discardComments from 'postcss-discard-comments';
import safe from 'postcss-safe-parser';
import postcssDoubleEscape from './escape.js';
const compileTailwind = (config, css, context) => {
    const root = postcss().process(css, { parser: safe }).root;
    const applyDirectives = [];
    root.walkAtRules('apply', atRule => {
        applyDirectives.push({ atRule: atRule, parentRule: atRule.parent });
    });
    if (!applyDirectives.length)
        return null;
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
        }
        else {
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
//# sourceMappingURL=compileTailwind.js.map