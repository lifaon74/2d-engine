const QxPositionedStyleSheet = new CSSStyleSheet();

QxPositionedStyleSheet.replaceSync(`
  :host {
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    transform: translate3d(var(--qx-x), var(--qx-y), var(--qx-z));
    transform-origin: 0 0;
  }
`);

export function qxPositioned<GBase extends new (...args: any) => any>(base: GBase) {
  return class QxPositioned extends base {
    #x: number = 0;
    #y: number = 0;
    #z: number = 0;

    constructor(...args: any[]) {
      super(...args);

      this.shadowRoot!.adoptedStyleSheets.push(QxPositionedStyleSheet);

      this.style.setProperty('--qx-x', `${this.#x}px`);
      this.style.setProperty('--qx-y', `${this.#y}px`);
      this.style.setProperty('--qx-z', `${this.#z}px`);
    }

    /* POSITION */

    get x(): number {
      return this.#x;
    }

    set x(value: number) {
      this.#x = value;
      this.style.setProperty('--qx-x', `${value}px`);
    }

    get y(): number {
      return this.#y;
    }

    set y(value: number) {
      this.#y = value;
      this.style.setProperty('--qx-y', `${value}px`);
    }

    get z(): number {
      return this.#z;
    }

    set z(value: number) {
      this.#z = value;
      this.style.setProperty('--qx-z', `${value}px`);
    }
  };
}
