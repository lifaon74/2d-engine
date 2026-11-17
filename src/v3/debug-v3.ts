import { Uint8Array2d } from './images/built-in/uint8-array-2d';
import { Data2d } from './images/data-2d';

/*--------*/

export class QxBox {
  readonly #width: number;
  readonly #height: number;

  readonly #x: number;
  readonly #y: number;
  readonly #z: number;

  constructor(width: number, height: number, x: number, y: number, z: number) {
    this.#width = width;
    this.#height = height;
    this.#x = x;
    this.#y = y;
    this.#z = z;
  }

  get width(): number {
    return this.#width;
  }

  get height(): number {
    return this.#height;
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

export class QxTile extends QxBox {
  static readonly bytesPerBlock: number = 6;

  readonly #image: Data2d;
  readonly #layer: number;

  constructor(image: Data2d, x: number, y: number, z: number, layer: number = 0) {
    if (image.bytesPerBlock !== QxTile.bytesPerBlock) {
      throw new Error(`"image.bytesPerBlock" should be ${QxTile.bytesPerBlock}`);
    }
    super(image.width, image.height, x, y, z);
    this.#image = image;
    this.#layer = layer;
  }

  get image(): Data2d {
    return this.#image;
  }

  get layer(): number {
    return this.#layer;
  }
}

export class QxTilePancake {
  readonly #opaqueLayer: Data2d;
  readonly #transparentLayers: readonly Data2d[];
  readonly #transparentLayersStartIndexes: Uint8Array;
  readonly #transparentLayersEndIndexes: Uint8Array;

  constructor(width: number, height: number, layers: number = 8) {
    this.#opaqueLayer = new Uint8Array2d(width, height, QxTile.bytesPerBlock);
    this.#transparentLayers = Array.from({ length: layers }, (): Uint8Array2d => {
      return new Uint8Array2d(width, height, QxTile.bytesPerBlock);
    });
    this.#transparentLayersStartIndexes = new Uint8Array(width * height);
    this.#transparentLayersEndIndexes = new Uint8Array(width * height);
  }

  get opaqueLayer(): Data2d {
    return this.#opaqueLayer;
  }

  get transparentLayers(): readonly Data2d[] {
    return this.#transparentLayers;
  }

  #clearLayers(): void {
    this.#opaqueLayer.clear();
    const mid: number = Math.floor(this.#transparentLayers.length / 2);
    this.#transparentLayersStartIndexes.fill(mid);
    this.#transparentLayersEndIndexes.fill(mid);
  }

  generatePancake(tiles: readonly QxTile[]): void {}
}

// export class QxTilePancake {
//   static create(width: number, height: number, layers: number = 8): QxTilePancake {
//     return new QxTilePancake(
//       new Uint8Array2d(width, height, QxTile.bytesPerBlock),
//       Array.from({ length: layers }, (): Uint8Array2d => {
//         return new Uint8Array2d(width, height, QxTile.bytesPerBlock);
//       }),
//       new Uint8Array(width * height),
//       new Uint8Array(width * height),
//     );
//   }
//
//   readonly #opaqueLayer: Data2d;
//   readonly #transparentLayers: readonly Data2d[];
//   readonly #transparentLayersStartIndexes: Uint8Array;
//   readonly #transparentLayersEndIndexes: Uint8Array;
//
//   protected constructor(
//     opaqueLayer: Data2d,
//     transparentLayers: readonly Data2d[],
//     transparentLayersStartIndexes: Uint8Array,
//     transparentLayersEndIndexes: Uint8Array,
//   ) {
//     this.#opaqueLayer = opaqueLayer;
//     this.#transparentLayers = transparentLayers;
//     this.#transparentLayersStartIndexes = transparentLayersStartIndexes;
//     this.#transparentLayersEndIndexes = transparentLayersEndIndexes;
//   }
//
//   get opaqueLayer(): Data2d {
//     return this.#opaqueLayer;
//   }
//
//   get transparentLayers(): readonly Data2d[] {
//     return this.#transparentLayers;
//   }
//
//   #clearLayers(): void {
//     this.#opaqueLayer.clear();
//     const mid: number = Math.floor(this.#transparentLayers.length / 2);
//     this.#transparentLayersStartIndexes.fill(mid);
//     this.#transparentLayersEndIndexes.fill(mid);
//   }
//
//   generatePancake(tiles: readonly QxTile[]): void {}
// }

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

// export class QxTileQuadTree {
//   readonly children: [
//     QxTileQuadTree | undefined,
//     QxTileQuadTree | undefined,
//     QxTileQuadTree | undefined,
//     QxTileQuadTree | undefined,
//   ] = new Array<QxTileQuadTree | undefined>(4);
//
//   add(tile: QxTile): void {
//
//   }
// }

export class QxTileRenderer {
  static readonly quadTreeDepth: number = 32;

  readonly #quadTrees: readonly QxTileQuadTree[];

  // readonly #quadTree:
  // readonly #tiles: readonly QxTile[];

  constructor(layers: number = 8) {
    this.#quadTrees = Array.from({ length: layers }, (): QxTileQuadTree => {
      return new QxTileQuadTree();
    });
    // this.#tiles = [];
  }

  add(tile: QxTile): void {}

  remove(tile: QxTile): void {}

  render(): void {}
}

/*--------*/

async function debugV3_00() {
  const img = await Uint8Array2d.fromUrl(
    'assets/floors/floor--grass-01.png',
    // new URL('assets/floors/floor--grass-01.png', import.meta.url),
  );
  // const img = new Uint8Array2d(256, 256);

  img.display();
}

async function debugV3_01() {
  const img = await Uint8Array2d.fromUrl('assets/trees/tree-00.png');

  const tile = new QxTile(img, 0, 0, 0);

  img.display();
}

/*--------*/

export async function debugV3() {
  // await debugV3_00();
  await debugV3_01();
}
