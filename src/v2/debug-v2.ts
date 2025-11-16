import { QxTile } from './components/qx-tile/qx-tile';
import { QxViewport } from './components/qx-viewport';

/*--------*/

/*--------*/

export function debugV2() {
  const viewport = new QxViewport();
  // viewport.width = 256;
  // viewport.height = 256;
  viewport.width = 1024;
  viewport.height = 1024;
  viewport.scale = 1;
  document.body.appendChild(viewport);

  const tileWith: number = 16;
  const tileHeight: number = 16;

  for (let x: number = 0; x < viewport.width / tileWith; x++) {
    for (let y: number = 0; y < viewport.height / tileHeight; y++) {
      const tile = new QxTile();
      tile.width = tileWith;
      tile.height = tileHeight;
      tile.x = x * tileWith;
      tile.y = y * tileHeight;
      tile.src = 'assets/floors/floor--grass-01.png';
      viewport.appendChild(tile);
    }
  }

  const animate = (): void => {
    // viewport.x = (viewport.x + 1) % viewport.width;
    requestAnimationFrame(animate);
  };
  animate();
}
