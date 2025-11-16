import { QxElement } from './helpers/qx-element';
import { qxSized } from './helpers/qx-sized';

const QxViewportStyleSheet = new CSSStyleSheet();

QxViewportStyleSheet.replaceSync(`
  :host {
    border: 2px solid black;
    transform: scale(var(--qx-viewport--scale));
    transform-origin: 0 0;
    image-rendering: pixelated;
    
    & > .view {
      transform: translate3d(var(--qx-viewport--x), var(--qx-viewport--y), 0);
    }
  }
`);

export class QxViewport extends qxSized(QxElement) {
  #x: number = 0;
  #y: number = 0;

  #scale: number = 1;

  constructor() {
    super();

    this.shadowRoot!.adoptedStyleSheets.push(QxViewportStyleSheet);
    this.shadowRoot!.innerHTML = `
      <div class="view">
        <slot></slot>
      </div>
    `;

    this.style.setProperty('--qx-viewport--x', `${this.#x}px`);
    this.style.setProperty('--qx-viewport--y', `${this.#y}px`);

    this.style.setProperty('--qx-viewport--scale', String(this.#scale));
  }

  /* POSITION */

  get x(): number {
    return this.#x;
  }

  set x(value: number) {
    this.#x = value;
    this.style.setProperty('--qx-viewport--x', `${-value}px`);
  }

  get y(): number {
    return this.#y;
  }

  set y(value: number) {
    this.#y = value;
    this.style.setProperty('--qx-viewport--y', `${-value}px`);
  }

  /* SIZE */

  get scale(): number {
    return this.#scale;
  }

  set scale(value: number) {
    this.#scale = value;
    this.style.setProperty('--qx-viewport--scale', String(value));
  }
}

customElements.define('qx-viewport', QxViewport);
