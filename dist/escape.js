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
export default postcssDoubleEscape;
//# sourceMappingURL=escape.js.map