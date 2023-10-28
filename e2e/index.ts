
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
    static styles = [css`
            p {
                @apply bg-red-400;
            }
            h2 {
                @apply bg-red-200;
            }
            `,
            css`
            div {
                @apply bg-blue-200;
            }
            h3 {
                @apply bg-pink-200;
            }
            `
        ];
    protected render() {
        return html`<p class='text-blue-600'>I am green!</p>`;
    }
}
