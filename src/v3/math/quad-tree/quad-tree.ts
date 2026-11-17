// https://github.com/timohausmann/quadtree-js/blob/master/quadtree.js

export interface QuadTreeBox {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export type QuadTreeItem = QuadTreeBox;

export class SpaceSegmenter2d {
  readonly #depth: number;

  // the raw buffer containing the bytes.
  readonly #buffer: ArrayBuffer;
  // a DataView on this buffer.
  readonly #view: DataView;
  // an Uint8Array on this buffer.
  readonly #bytes: Uint8Array;

  constructor(depth: number) {
    this.#depth = depth;
    this.#buffer = new ArrayBuffer(0x100, {
      maxByteLength: 0x100000000,
    });
    this.#view = new DataView(this.#buffer);
    this.#bytes = new Uint8Array(this.#buffer);
  }

  get items(): readonly GItem[] {
    return this.#items;
  }

  insertBox(id: number /* u32 */, x: number, y: number, width: number, height: number): void {}
}
