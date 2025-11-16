import { Data2d } from './images/data-2d';

/*--------*/

export class QxTile {
  readonly #image: Data2d;
  readonly #x: number;
  readonly #y: number;
  readonly #z: number;

  constructor(image: Data2d, x: number, y: number, z: number) {
    if (image.bytesPerBlock !== 6) {
      throw new Error(`"image.bytesPerBlock" should be 6`);
    }
    this.#image = image;
    this.#x = x;
    this.#y = y;
    this.#z = z;
  }

  get image(): Data2d {
    return this.#image;
  }

  get x(): number {
    return this.#x;
  }

  get y(): number {
    return this.#y;
  }

  get z(): number {
    return this.#z;
  }
}

export class QxTilePancake {
  // static fromTiles(): QxTilePancake {}

  readonly #opaqueLayer: Data2d;
  readonly #transparentLayers: readonly Data2d[];

  constructor(opaqueLayer: Data2d, transparentLayers: readonly Data2d[]) {
    this.#opaqueLayer = opaqueLayer;
    this.#transparentLayers = transparentLayers;
  }

  get opaqueLayer(): Data2d {
    return this.#opaqueLayer;
  }

  get transparentLayers(): readonly Data2d[] {
    return this.#transparentLayers;
  }

  generatePancake(tiles: readonly QxTile[]): void {}
}

// export class QuadTreeItem {
//   readonly #x: number;
//   readonly #y: number;
//   readonly #width: number;
//   readonly #height: number;
//
//   constructor(x: number, y: number, width: number, height: number) {
//     this.#x = x;
//     this.#y = y;
//     this.#width = width;
//     this.#height = height;
//   }
//
//   get x(): number {
//     return this.#x;
//   }
//
//   get y(): number {
//     return this.#y;
//   }
//
//   get width(): number {
//     return this.#width;
//   }
//
//   get height(): number {
//     return this.#height;
//   }
// }
//
// export class QuadTree<GValue extends QuadTreeItem> {
//   #value: GValue;
//   readonly #child00: QuadTree<GValue> | undefined;
//
//   constructor() {}
// }

export class QxCpuRenderer2d {
  // readonly #quadTree:
  readonly #tiles: readonly QxTile[];

  constructor() {
    this.#tiles = [];
  }

  add(tile: QxTile): void {}

  remove(tile: QxTile): void {}

  render(): void {}
}

/*--------*/

export function debugV3() {
  const viewport = new QxViewport();
  // viewport.width = 256;
  // viewport.height = 256;
  viewport.width = 1024;
  viewport.height = 1024;
  viewport.scale = 1;
  document.body.appendChild(viewport);

  const tileWith: number = 16;
  const tileHeight: number = 16;

  for (let x: number = 0; x < viewport.width / tileWith; x++) {
    for (let y: number = 0; y < viewport.height / tileHeight; y++) {
      const tile = new QxTile();
      tile.width = tileWith;
      tile.height = tileHeight;
      tile.x = x * tileWith;
      tile.y = y * tileHeight;
      tile.src = 'assets/floors/floor--grass-01.png';
      viewport.appendChild(tile);
    }
  }

  const animate = (): void => {
    // viewport.x = (viewport.x + 1) % viewport.width;
    requestAnimationFrame(animate);
  };
  animate();
}
