#### Tailwind CSS 自定义提取逻辑

Tailwind CSS 默认提取文件中所有类名编译到`index.css`文件，但是`` css`xxx`  ``标签中的类名为内联样式，不应该被打包进`index.css`中，所以需要排除`` css`xxx`  ``中的内容被提取编译。

```js
tailwind.config.js;

module.exports = {
    content: {
        files: ['./src/**/*.ts'],
        extract: {
            ts: content => {
                return content.match(/[^<>"'`\s]*/);
            },
        },
    },
};
```

[Tailwind CSS Customizing extraction logic document](https://tailwindcss.com/docs/content-configuration#customizing-extraction-logic)


// const postcssDoubleEscape: PostcssPlugin = {
//     postcssPlugin: 'postcss-double-escape',
//     OnceExit(root) {
//         root.walkRules(rule => {
//             rule.selectors = rule.selectors.map(selector => {
//                 console.log('rule.selectors', rule.selectors);
//                 return selector.replace(/\\/g, '\\\\');
//             });
//         });
//     },
// };



// @ts-nocheck


// const postcssDoubleEscape: PostcssPlugin = {
//     postcssPlugin: 'postcss-double-escape',
//     RuleExit(rule) {
//         if (!Array.isArray(rule.selectors)) return;
//         rule.selectors = rule.selectors.map(selector => {
//             if (typeof selector !== 'string') return selector;
//             return selector.replace(/\\/g, '\\\\');
//         });
//     },
// };

viewport: null, deviceScaleFactor: undefined
