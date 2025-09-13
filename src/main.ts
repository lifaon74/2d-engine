import { createCanvasRenderingContext2d } from './helpers/create-canvas-rendering-context-2d';
import { displayCanvas } from './helpers/display-canvas';
import { download } from './helpers/download';
import { imageUrlToImageData } from './helpers/image-url-to-image-data';
import { ImageWithDepth } from './image-with-depth/image-with-depth';
import { CPUImageRenderer, RendererImageElement } from './renderer/cpu-image-renderer';

/*------*/

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
  displayCanvas(ctx.canvas);

  window.onclick = () => {
    download(ctx.canvas.toDataURL(), fileName);
  };
}

// await extractImage(2, 29, 2, 2, 'rock-brown-large-01.png');
// await extractImage(8, 29, 2, 2, 'rock-grey-large-00.png');
// await extractImage(5, 14, 5, 3, 'autotile--ground-with-grass.png');
// await extractImage(1, 0, 1, 1, 'floor--grass-01.png');

/*------*/

async function loadGrass01(): Promise<ImageWithDepth<Uint8Array>> {
  return ImageWithDepth.fromImageData(
    await imageUrlToImageData(new URL('../assets/floors/floor--grass-01.png?url', import.meta.url)),
    Uint8Array,
  );
}

async function loadTree00(): Promise<ImageWithDepth<Uint8Array>> {
  return ImageWithDepth.fromImageData(
    await imageUrlToImageData(new URL('../assets/trees/tree-00.png?url', import.meta.url)),
    Uint8Array,
  );
}

// async function loadTree01(): Promise<ImageWithDepth> {
//   return ImageWithDepth.fromImageData(
//     await imageUrlToImageData(new URL('../assets/tree-01.png', import.meta.url)),
//   );
// }

export interface AssembleAutoTileOptions {
  readonly tileSize: number;
  readonly generate: (
    x0y0: number,
    x1y0: number,
    x0y1: number,
    x1y1: number,
  ) => ImageWithDepth<any>;
  readonly width: number;
  readonly height: number;
  readonly map: ArrayLike<number>;
}

export function assembleAutoTile({
  tileSize,
  generate,
  width,
  height,
  map,
}: AssembleAutoTileOptions): ImageWithDepth<Uint8Array> {
  const output: ImageWithDepth<Uint8Array> = ImageWithDepth.new(
    (width - 1) * tileSize,
    (height - 1) * tileSize,
    Uint8Array,
  );

  for (let y: number = 1; y < height; y++) {
    for (let x: number = 1; x < width; x++) {
      const tile: ImageWithDepth<any> = generate(
        map[x - 1 + (y - 1) * width],
        map[x + (y - 1) * width],
        map[x - 1 + y * width],
        map[x + y * width],
      );
    }
  }

  return output;
}

/*------*/

async function debug_01() {
  // const renderer: CPUImageRenderer = new CPUImageRenderer(256, 256);
  // const renderer: CPUImageRenderer = new CPUImageRenderer(1024, 1024);
  const renderScale: number = 1 / 2;
  const renderer: CPUImageRenderer = new CPUImageRenderer(
    window.screen.width * renderScale,
    window.screen.height * renderScale,
  );

  renderer.setView(0, 0);

  const ctx = createCanvasRenderingContext2d(renderer.width, renderer.height);
  // scaleCanvas(ctx.canvas, 1 / renderScale);
  displayCanvas(ctx.canvas);

  const grass00: ImageWithDepth<Uint8Array> = await loadGrass01();
  const tree00: ImageWithDepth<Uint8Array> = await loadTree00();

  const elements: RendererImageElement[] = [];

  for (let y: number = 0; y < 68; y++) {
    for (let x: number = 0; x < 120; x++) {
      elements.push({
        x: x * 16,
        y: y * 16,
        z: -1,
        image: grass00,
      });
    }
  }

  for (let y: number = 0; y < 32; y++) {
    const s: number = ((y % 2) * 48) / 2;

    for (let x: number = 0; x < 32; x++) {
      elements.push({
        x: x * 48 + s,
        y: y * 32,
        z: y,
        image: tree00,
      });
    }
  }

  renderer.setElements(elements);

  // renderer.setElements([
  //   {
  //     x: 0,
  //     y: 0,
  //     z: 0,
  //     image: tree00,
  //   },
  //   // {
  //   //   x: 0,
  //   //   y: 0,
  //   //   z: 16,
  //   //   image: tree00,
  //   // },
  //   // {
  //   //   x: 0,
  //   //   y: 0,
  //   //   z: 8,
  //   //   image: tree00,
  //   // },
  //   // {
  //   //   x: 0,
  //   //   y: 0,
  //   //   z: 9,
  //   //   image: tree00,
  //   // },
  //   //
  //   // {
  //   //   x: 0,
  //   //   y: 0,
  //   //   z: 3,
  //   //   image: tree00,
  //   // },
  //   // {
  //   //   x: 0,
  //   //   y: 0,
  //   //   z: 4,
  //   //   image: tree00,
  //   // },
  //   // {
  //   //   x: 0,
  //   //   y: 0,
  //   //   z: 2,
  //   //   image: tree00,
  //   // },
  //   // {
  //   //   x: 0,
  //   //   y: 0,
  //   //   z: 2,
  //   //   image: tree00,
  //   // },
  // ]);

  console.time('render');
  renderer.renderLayers();
  renderer.renderOutput();
  console.timeEnd('render');

  // renderer.setElements(renderer.extractLayers());
  //
  // console.time('render2');
  // renderer.renderLayers();
  // renderer.renderOutput();
  // console.timeEnd('render2');

  ctx.putImageData(renderer.output, 0, 0);

  Object.assign(window, {
    renderer,
  });
}

async function main() {
  // await debug_00();
  await debug_01();
}

main();
