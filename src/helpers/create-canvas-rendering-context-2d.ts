export function createCanvasRenderingContext2d(
  width: number,
  height: number,
): CanvasRenderingContext2D {
  const ctx: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d')!;
  ctx.canvas.width = width;
  ctx.canvas.height = height;
  return ctx;
}
