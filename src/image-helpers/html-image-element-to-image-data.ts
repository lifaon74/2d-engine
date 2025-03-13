export async function htmlImageElementToImageData(img: HTMLImageElement): Promise<ImageData> {
  await img.decode();
  const ctx: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d')!;
  ctx.canvas.width = img.naturalWidth;
  ctx.canvas.height = img.naturalHeight;
  ctx.drawImage(img, 0, 0);
  // document.body.appendChild(ctx.canvas);
  return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
}
