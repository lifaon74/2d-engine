const QxSizedStyleSheet = new CSSStyleSheet();

QxSizedStyleSheet.replaceSync(`
  :host {
    width: var(--qx-width);
    height: var(--qx-height);
  }
`);

export function qxSized<GBase extends new (...args: any) => any>(base: GBase) {
  return class QxSized extends base {
    #width: number = 0;
    #height: number = 0;

    constructor(...args: any[]) {
      super(...args);

      this.shadowRoot!.adoptedStyleSheets.push(QxSizedStyleSheet);

      this.style.setProperty('--qx-width', `${this.#width}px`);
      this.style.setProperty('--qx-height', `${this.#height}px`);
    }

    /* SIZE */

    get width(): number {
      return this.#width;
    }

    set width(value: number) {
      this.#width = value;
      this.style.setProperty('--qx-width', `${value}px`);
    }

    get height(): number {
      return this.#height;
    }

    set height(value: number) {
      this.#height = value;
      this.style.setProperty('--qx-height', `${value}px`);
    }
  };
}
