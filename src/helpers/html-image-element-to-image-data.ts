import { createCanvasRenderingContext2d } from './create-canvas-rendering-context-2d';

export async function htmlImageElementToImageData(img: HTMLImageElement): Promise<ImageData> {
  await img.decode();
  const ctx: CanvasRenderingContext2D = createCanvasRenderingContext2d(
    img.naturalWidth,
    img.naturalHeight,
  );
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
}
