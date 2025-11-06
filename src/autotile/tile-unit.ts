export interface TileUnit {
  (value: number): number;
}

export function createTileUnit(tileSize: number): TileUnit {
  return (value: number): number => value * tileSize;
}
