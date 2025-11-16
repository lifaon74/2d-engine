import { DataImage2d } from '../../images/built-in/data-image2d';
import { createTileUnit } from '../autotile/tile-unit';

// async function extractFlurmimonsTilesetTiles() {
//   const tilesetUrl: URL = new URL(
//     '../../assets/raw/flurmimons_tileset___nature_by_flurmimon_d9leui9-fullview.png',
//     import.meta.url,
//   );
//
//   const tileset = await DataImage2d.fromUrl(tilesetUrl);
//
//   const tileSize: number = 16;
//
//   const tile = (p: number): number => {
//     return p * tileSize;
//   };
//
//   const autoTile: DataImage2d = tileset.cut(tile(5), tile(14), tile(5), tile(3));
//
//   autoTile.display(2);
//
//   const outputAutotileTileSize: number = tileSize * 2;
//
//   const otile = (p: number): number => {
//     return p * outputAutotileTileSize;
//   };
//
//   const outputAutotile = new DataImage2d(outputAutotileTileSize * 0b1111, outputAutotileTileSize);
//
//   // autoTile.cut(tile(0), tile(0), tile(1), tile(1)), tile(0), tile(0)
//
//   outputAutotile
//     // 0b0001
//     .put(autoTile.cut(tile(2), tile(2), tile(1), tile(1)), otile(1), otile(0))
//     // 0b0010
//     .put(autoTile.cut(tile(0), tile(2), tile(1), tile(1)), otile(2.5), otile(0))
//     // 0b0011
//     .put(autoTile.cut(tile(1), tile(2), tile(1), tile(1)), otile(3), otile(0))
//     .put(autoTile.cut(tile(1), tile(2), tile(1), tile(1)), otile(3.5), otile(0))
//     .display(2);
//
//   // tileset
//   //   .cut(-16, -16, 32, 32)
//   //   .put(tileset.cut(16, 0, 16, 16), 0, 0)
//   //   .display();
// }

async function extractFlurmimonsTilesetTiles() {
  const tilesetUrl: URL = new URL(
    '../../assets/raw/flurmimons_tileset___nature_by_flurmimon_d9leui9-fullview.png',
    import.meta.url,
  );

  const tileset = await DataImage2d.fromUrl(tilesetUrl);

  const tile = createTileUnit(16);

  const autoTile: DataImage2d = tileset.cut(tile(5), tile(14), tile(5), tile(3));

  autoTile.display(2);

  const outputAutotile = new DataImage2d(tile(0b10000), tile(1));

  outputAutotile
    // 0b0000
    // 0b0001
    .put(autoTile.cut(tile(2), tile(2), tile(1), tile(1)), tile(1), tile(0))
    // 0b0010
    .put(autoTile.cut(tile(0), tile(2), tile(1), tile(1)), tile(2), tile(0))
    // 0b0011
    .put(autoTile.cut(tile(1), tile(2), tile(1), tile(1)), tile(3), tile(0))
    // 0b0100
    .put(autoTile.cut(tile(2), tile(0), tile(1), tile(1)), tile(4), tile(0))
    // 0b0101
    .put(autoTile.cut(tile(2), tile(1), tile(1), tile(1)), tile(5), tile(0))
    // 0b0110
    .put(new DataImage2d(tile(1), tile(1)).fill([255, 0, 0, 255]), tile(6), tile(0))
    // 0b0111
    .put(autoTile.cut(tile(3), tile(1), tile(1), tile(1)), tile(7), tile(0))
    // 0b1000
    .put(autoTile.cut(tile(0), tile(0), tile(1), tile(1)), tile(8), tile(0))
    // 0b1001
    .put(new DataImage2d(tile(1), tile(1)).fill([255, 0, 0, 255]), tile(9), tile(0))
    // 0b1010
    .put(autoTile.cut(tile(0), tile(1), tile(1), tile(1)), tile(10), tile(0))
    // 0b1011
    .put(autoTile.cut(tile(4), tile(1), tile(1), tile(1)), tile(11), tile(0))
    // 0b1100
    .put(autoTile.cut(tile(1), tile(0), tile(1), tile(1)), tile(12), tile(0))
    // 0b1101
    .put(autoTile.cut(tile(3), tile(2), tile(1), tile(1)), tile(13), tile(0))
    // 0b1110
    .put(autoTile.cut(tile(4), tile(2), tile(1), tile(1)), tile(14), tile(0))
    // 0b1111
    .put(autoTile.cut(tile(1), tile(1), tile(1), tile(1)), tile(15), tile(0))
    .display(2);
  // .download('autotile--ground-with-grass.png');
}

export async function debugImage2d() {
  await extractFlurmimonsTilesetTiles();
}
