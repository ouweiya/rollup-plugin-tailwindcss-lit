
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('my-element')
export class MyElement extends LitElement {
    static styles = css`
            p {
                color: green;
                @apply bg-red-200;
            }`
        ;
    protected render() {
        return html`<p class='text-blue-600'>I am green!</p>`;
    }
}
