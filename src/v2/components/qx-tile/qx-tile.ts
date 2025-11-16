import { QxElement } from '../helpers/qx-element';
import { qxPositioned } from '../helpers/qx-positioned';
import { qxSized } from '../helpers/qx-sized';

const QxTileStyleSheet = new CSSStyleSheet();

QxTileStyleSheet.replaceSync(`
  :host {
    background-image: var(--qx-tile--src);
    background-size: var(--qx-width) var(--qx-height);
    background-origin: var(--qx-tile--src-x) var(--qx-tile--src-y);
    background-repeat: no-repeat;
  }
`);

export class QxTile extends qxPositioned(qxSized(QxElement)) {
  #src: string = '';
  #srcX: number = 0;
  #srcY: number = 0;

  constructor() {
    super();

    this.shadowRoot!.adoptedStyleSheets.push(QxTileStyleSheet);

    this.style.setProperty('--qx-tile--src', `url(${this.#src})`);
    this.style.setProperty('--qx-tile--src-x', `${this.#srcX}px`);
    this.style.setProperty('--qx-tile--src-y', `${this.#srcY}px`);
  }

  /* SRC */

  get src(): string {
    return this.#src;
  }

  set src(value: string) {
    this.#src = value;
    this.style.setProperty('--qx-tile--src', `url(${JSON.stringify(value)})`);
  }

  get srcX(): number {
    return this.#srcX;
  }

  set srcX(value: number) {
    this.#srcX = value;
    this.style.setProperty('--qx-tile--src-x', `${value}px`);
  }

  get srcY(): number {
    return this.#srcY;
  }

  set srcY(value: number) {
    this.#srcY = value;
    this.style.setProperty('--qx-tile--src-y', `${value}px`);
  }
}

customElements.define('qx-tile', QxTile);
