import { createCanvasRenderingContext2d } from './create-canvas-rendering-context-2d';
import { download } from './download';

export function saveImageData(imageData: ImageData, fileName: string): void {
  const ctx: CanvasRenderingContext2D = createCanvasRenderingContext2d(
    imageData.width,
    imageData.height,
  );
  ctx.putImageData(imageData, 0, 0);
  return download(ctx.canvas.toDataURL(), fileName);
}
