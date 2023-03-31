### Using Tailwind CSS in Lit and importing CSS in a modular way.

## Install

```console
npm i rollup-plugin-tailwindcss-lit -D
```

## Usage

**`rollup.config.js`**

```js
import tailwindcss from 'rollup-plugin-tailwindcss-lit';

export default {
  ...
  plugins: [tailwindcss()],
};
```

```js
import csstxt from './index.css';

@customElement('my-element')
class One extends LitElement {
  static styles = [csstxt];

  render() {
    return html`<p class="text-blue-500">Hello from my template.</p>`;
  }
}
```

## `postcss.config.js`

Use the ES module for the configuration file and add `"type": "module"` in package.json.

Minimize CSS code after compiling tailwindcss.

```js
import tailwindcss from 'tailwindcss';
import cssnano from 'cssnano';

export default {
  plugins: [tailwindcss, cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })],
};
```

## Dev and Prod

```js
import tailwindcss from 'tailwindcss';
import cssnano from 'cssnano';

const isDevelopment = process.argv.some(arg => /--watch|-w|dev-server/.test(arg));

const plugins = isDevelopment
  ? [tailwindcss]
  : [tailwindcss, cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })];

export default {
  plugins,
};
```
