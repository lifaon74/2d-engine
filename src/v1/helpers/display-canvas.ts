export function displayCanvas(canvas: HTMLCanvasElement): void {
  canvas.style.border = `2px solid black`;
  canvas.style.margin = `32px`;
  document.body.appendChild(canvas);
}
