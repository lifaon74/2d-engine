export function scaleCanvas(canvas: HTMLCanvasElement, scale: number): void {
  canvas.style.imageRendering = 'pixelated';
  canvas.style.width = `${canvas.width * scale}px`;
  canvas.style.height = `${canvas.height * scale}px`;
}
