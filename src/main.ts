import { createCanvasRenderingContext2d } from './helpers/create-canvas-rendering-context-2d';
import { displayCanvas } from './helpers/display-canvas';
import { download } from './helpers/download';
import { imageUrlToImageData } from './helpers/image-url-to-image-data';
import { scaleCanvas } from './helpers/scale-canvas';
import { Texture2dWithZBuffer } from './texture/texture2d-with-z-buffer';

// import tilesetUrl from '../assets/flurmimons_tileset___nature_by_flurmimon_d9leui9-fullview.png';
const tilesetUrl: URL = new URL(
  '../assets/raw/flurmimons_tileset___nature_by_flurmimon_d9leui9-fullview.png',
  import.meta.url,
);

async function extractImage(x: number, y: number, w: number, h: number, fileName: string) {
  const imageData = await imageUrlToImageData(tilesetUrl);

  const ctx: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d')!;
  ctx.canvas.width = w * 16;
  ctx.canvas.height = h * 16;
  console.log(x * 16, y * 16, w * 16, h * 16);
  ctx.putImageData(imageData, -x * 16, -y * 16, x * 16, y * 16, w * 16, h * 16);
  download(ctx.canvas.toDataURL(), fileName);
}

// await extractImage(0, 6, 3, 4, 'tree-00.png');
// await extractImage(0, 10, 3, 4, 'tree-01.png');

async function loadTree00(): Promise<Texture2dWithZBuffer> {
  return Texture2dWithZBuffer.fromImageData(
    await imageUrlToImageData(new URL('../assets/tree-00.png', import.meta.url)),
  );
}

async function loadTree01(): Promise<Texture2dWithZBuffer> {
  return Texture2dWithZBuffer.fromImageData(
    await imageUrlToImageData(new URL('../assets/tree-01.png', import.meta.url)),
  );
}

/*-------*/

export class CanvasRenderer {
  readonly #ctx: CanvasRenderingContext2D;
  #mainTexture: Texture2dWithZBuffer;

  readonly #textures: Set<Texture2dWithZBuffer>;

  constructor(width: number, height: number) {
    this.#ctx = createCanvasRenderingContext2d(width, height);
    this.#mainTexture = new Texture2dWithZBuffer(width, height);
    this.#textures = new Set<Texture2dWithZBuffer>();
  }

  get canvas(): HTMLCanvasElement {
    return this.#ctx.canvas;
  }

  get textures(): Set<Texture2dWithZBuffer> {
    return this.#textures;
  }

  setSize(width: number, height: number): this {
    this.#ctx.canvas.width = width;
    this.#ctx.canvas.height = height;

    this.#mainTexture = new Texture2dWithZBuffer(width, height);

    return this;
  }

  render(): void {
    this.#mainTexture.clear();
    this.#ctx.putImageData(this.#mainTexture.toImageData(), 0, 0);
  }
}

/*-------*/

export class Character {
  readonly name: string;
}

export class NPC extends Character {
  interact(player: any): void {
    // player pressed "SPACE" near NPC
  }
}

export class Player extends Character {
  readonly name: string;
}

export class WorldBlocBuilder {
  generate(): Texture2dWithZBuffer {}
}

export class WorldMap {}

/*-------*/

// async function debug_00() {
//   const width: number = window.screen.availWidth * devicePixelRatio;
//   const height: number = window.screen.availHeight * devicePixelRatio;
//   // const map = new Texture2dWithHeightMap(width, height);
//   // const map = new Texture2dWithHeightMap(3840, 2160); // 4K
//   const map = new Texture2dZBuffer(256, 256);
//
//   const tree00 = await loadTree00();
//   const tree01 = await loadTree01();
//
//   const ctx: CanvasRenderingContext2D = createCanvasRenderingContext2d(map.width, map.height);
//   scaleCanvas(ctx.canvas, 1);
//   displayCanvas(ctx.canvas);
//   // document.body.appendChild(ctx.canvas);
//
//   console.time('render');
//
//   for (let y: number = 0; y < 100; y++) {
//     const _x: number = y % 2 === 0 ? 0 : 16 * 1.5;
//
//     for (let x: number = 0; x < 100; x++) {
//       map.put(tree00, x * 16 * 3 + _x, y * 16 * 2, 0);
//     }
//   }
//   // map.draw(tree00, 0, 0, 0);
//   // map.draw(tree01, 32, 0, 1);
//
//   ctx.putImageData(map.toImageData(), 0, 0);
//   console.timeEnd('render');
//
//   // window.onclick = () => {
//   //   document.body.requestFullscreen();
//   // };
// }

async function debug_01() {
  const renderer = new CanvasRenderer(256, 256);

  const tree00 = await loadTree00();
  const tree01 = await loadTree01();

  scaleCanvas(renderer.canvas, 1);
  displayCanvas(renderer.canvas);

  console.time('write-textures');
  renderer.textures.add(tree00);

  for (let y: number = 0; y < 100; y++) {
    const _x: number = y % 2 === 0 ? 0 : 16 * 1.5;

    for (let x: number = 0; x < 100; x++) {
      renderer.textures.add(tree00);
    }
  }

  console.timeEnd('write-textures');

  console.time('render');

  // map.draw(tree00, 0, 0, 0);
  // map.draw(tree01, 32, 0, 1);

  ctx.putImageData(map.toImageData(), 0, 0);
  console.timeEnd('render');

  // window.onclick = () => {
  //   document.body.requestFullscreen();
  // };
}

async function main() {
  // await debug_00();
  await debug_01();
}

main();
