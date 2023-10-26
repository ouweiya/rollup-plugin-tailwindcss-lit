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

Suggest using [`@rollup/plugin-alias`](https://github.com/rollup/plugins/tree/master/packages/alias#readme) to shorten import paths.

```js
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const cssPath = resolve(dirname(__filename), 'src/index.css'); // Absolute path

plugins: [alias({ entries: [{ find: 'index.css', replacement: cssPath }] }), ...];
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

The [`@apply`](https://tailwindcss.com/docs/functions-and-directives#apply) directive supports multiple features, for example: `@apply hover:bg-blue-700`.

#### Tailwind CSS IntelliSense supports CSS tags.

```json
"tailwindCSS.experimental.classRegex": [["css\\s*`([^`]*)`", "@apply\\s+([^;\\n]+?)(?:;|\\n)"]],
```

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
import cssnano from 'cssnano'; // Minify CSS
import remToPx from '@thedutchcoder/postcss-rem-to-px'; // Convert rem units to px

const plugins =
    process.env['NODE_ENV'] === 'build'
        ? [tailwindcss(), remToPx(), cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })]
        : [tailwindcss(), remToPx()];

export default { plugins };
```

