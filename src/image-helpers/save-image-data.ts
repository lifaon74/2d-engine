import { download } from './download';

export function saveImageData(imageData: ImageData, fileName: string): void {
  const ctx: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d')!;
  ctx.canvas.width = imageData.width;
  ctx.canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);
  return download(ctx.canvas.toDataURL(), fileName);
}
