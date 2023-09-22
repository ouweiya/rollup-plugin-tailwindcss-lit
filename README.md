### Rollup plugin to use Tailwind CSS in Lit.

## Install

```console
npm i rollup-plugin-tailwindcss-lit
```

## Usage

### rollup.config.js

```js
import tailwindcss from 'rollup-plugin-tailwindcss-lit';

export default {
    ...
    plugins: [tailwindcss()],
};
```

```js
import styles from 'index.css';

@customElement('my-element')
class One extends LitElement {
    static styles = [styles];

    render() {
        return html`<p class="text-blue-500">Hello</p>`;
    }
}
```

It's recommended to use the [`@rollup/plugin-alias`](https://github.com/rollup/plugins/tree/master/packages/alias#readme) plugin to avoid the long path of `index.css`.

```js
plugins: [
    ...
    alias({ entries: [{ find: 'index.css', replacement: 'File path' }] }),
]
```

#### Compile inline CSS

```js
static styles = [
    styles,
    css`
        :host {
            @apply text-blue-600;
            width: 100px;
        }
    `,
];
```

#### After compilation

```js
static styles = [
    styles,
    css`
        :host {
            width: 100px;
        }
        :host {
            --tw-text-opacity: 1;
            color: rgb(37 99 235 / var(--tw-text-opacity));
        }
    `,
];
```

[`@apply`](https://tailwindcss.com/docs/functions-and-directives#apply) directives，支持多种用法，例如：`@apply hover:bg-blue-700`
The `@apply` directive supports multiple features, for example: `@apply hover:bg-blue-700`.

#### Inline CSS should always include a selector.

##### Wrong Way

```js
const other = css`@apply text-blue-50`;

static styles = [
    styles,
    css`
        :host {
            color: ${other};
        }
    `,
];
```

##### Right Way

```js
const other = css`:host { @apply text-blue-50 }`;

static styles = [
    styles,
    css`
        p {
            color: red;
        }
        ${other}
    `,
];
```


## postcss.config.js

```js
import tailwindcss from 'tailwindcss';

export default {
    plugins: [tailwindcss],
};
```

## Dev and Prod

Use different plugins for different environments. It's recommended to use the Rollup environment command, `--environment NODE_ENV:dev`.
[environment-values](https://rollupjs.org/command-line-interface/#environment-values)

```js
import tailwindcss from 'tailwindcss';
import cssnano from 'cssnano';  // Minify CSS
import remToPx from '@thedutchcoder/postcss-rem-to-px';  // Convert rem units to px

const plugins =
    process.env['NODE_ENV'] === 'build'
        ? [tailwindcss, remToPx, cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })]
        : [tailwindcss, remToPx];

export default { plugins };
```
