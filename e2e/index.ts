
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
import style from './index.css';

@customElement('my-element')
export class MyElement extends LitElement {
    static styles = [style, 
        css`
        {
            color: green;
            @apply bg-pink-500;
        }`,
        css`
        h3 {
            @apply bg-red-500;
        }`
        ];
    protected render() {
        return html`<p class='text-blue-600'>I am green!</p>`;
    }
}
