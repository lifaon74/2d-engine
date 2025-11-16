const QxElementStyleSheet = new CSSStyleSheet();

QxElementStyleSheet.replaceSync(`
  :host {
    display: block;
    overflow: hidden;
  }
`);

export class QxElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot!.adoptedStyleSheets.push(QxElementStyleSheet);
  }
}
