import tailwindcss from 'tailwindcss';
import cssnano from 'cssnano';
import remToPx from '@thedutchcoder/postcss-rem-to-px';

const plugins =
    process.env['NODE_ENV'] === 'build'
        ? [tailwindcss(), remToPx(), cssnano({ preset: ['default', { discardComments: { removeAll: true } }] })]
        : [tailwindcss(), remToPx()];

export default { plugins };
