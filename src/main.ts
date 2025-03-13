import { download } from './image-helpers/download';
import { urlToImageData } from './image-helpers/url-to-image-data';
import { Texture2dWithHeightMap } from './texture/texture-2d-with-height-map';

// import tilesetUrl from '../assets/flurmimons_tileset___nature_by_flurmimon_d9leui9-fullview.png';
const tilesetUrl: URL = new URL(
  '../assets/raw/flurmimons_tileset___nature_by_flurmimon_d9leui9-fullview.png',
  import.meta.url,
);

async function extractImage(x: number, y: number, w: number, h: number, fileName: string) {
  const imageData = await urlToImageData(tilesetUrl);

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
    await urlToImageData(new URL('../assets/tree-00.png', import.meta.url)),
  );
}

async function loadTree01(): Promise<Texture2dWithHeightMap> {
  return Texture2dWithHeightMap.fromImageData(
    await urlToImageData(new URL('../assets/tree-01.png', import.meta.url)),
  );
}

async function debug_00() {
  const tree00 = await loadTree00();
  const tree01 = await loadTree01();
  tree01.depth.fill(10);

  tree00.draw(tree01, 0, 0);

  const ctx: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d')!;
  ctx.canvas.width = tree00.width;
  ctx.canvas.height = tree00.height;
  document.body.appendChild(ctx.canvas);
  ctx.putImageData(tree00.toImageData(), 0, 0);
}

async function main() {
  await debug_00();
  // const canvas = document.createElement('canvas');
  // const ctx = canvas.getContext('2d');
  // // ctx.drawImage
  // ctx.putImageData();
}

main();
