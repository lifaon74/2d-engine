import { createCanvasRenderingContext2d } from './helpers/create-canvas-rendering-context-2d';
import { displayCanvas } from './helpers/display-canvas';
import { download } from './helpers/download';
import { imageUrlToImageData } from './helpers/image-url-to-image-data';
import { scaleCanvas } from './helpers/scale-canvas';
import { Texture2dWithHeightMap } from './texture/texture-2d-with-height-map';

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

async function loadTree00(): Promise<Texture2dWithHeightMap> {
  return Texture2dWithHeightMap.fromImageData(
    await imageUrlToImageData(new URL('../assets/tree-00.png', import.meta.url)),
  );
}

async function loadTree01(): Promise<Texture2dWithHeightMap> {
  return Texture2dWithHeightMap.fromImageData(
    await imageUrlToImageData(new URL('../assets/tree-01.png', import.meta.url)),
  );
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
  generate(): Texture2dWithHeightMap {}
}

export class WorldMap {}

/*-------*/

async function debug_00() {
  // 4K
  // const map = new Texture2dWithHeightMap(3840, 2160);
  const map = new Texture2dWithHeightMap(256, 256);

  const tree00 = await loadTree00();
  const tree01 = await loadTree01();

  const ctx: CanvasRenderingContext2D = createCanvasRenderingContext2d(map.width, map.height);
  scaleCanvas(ctx.canvas, 1);
  displayCanvas(ctx.canvas);

  console.time('render');

  for (let y: number = 0; y < 100; y++) {
    const _x: number = y % 2 === 0 ? 0 : 16 * 1.5;

    for (let x: number = 0; x < 100; x++) {
      map.put(tree00, x * 16 * 3 + _x, y * 16 * 2, 0);
    }
  }
  // map.draw(tree00, 0, 0, 0);
  // map.draw(tree01, 32, 0, 1);

  ctx.putImageData(map.toImageData(), 0, 0);
  console.timeEnd('render');
}

async function main() {
  // await debug_00();
}

main();
