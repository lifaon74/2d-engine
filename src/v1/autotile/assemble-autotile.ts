import { ImageWithDepth } from '../image-with-depth/image-with-depth';
import { RendererImageElement } from '../renderer/cpu-image-renderer';

export interface GenerateAutotileSubTile {
  (x0y0: number, x1y0: number, x0y1: number, x1y1: number): ImageWithDepth<any>;
}

export interface AssembleAutotileOptions {
  readonly tileSize: number;
  readonly generate: GenerateAutotileSubTile;
  readonly width: number;
  readonly height: number;
  readonly z: number;
  readonly map: ArrayLike<number>;
}

export function assembleAutotile(
  { tileSize, generate, width, height, z, map }: AssembleAutotileOptions,
  elements: RendererImageElement[] = [],
): RendererImageElement[] {
  for (let y: number = 1; y < height; y++) {
    for (let x: number = 1; x < width; x++) {
      elements.push({
        x: x * tileSize,
        y: y * tileSize,
        z,
        image: generate(
          map[x - 1 + (y - 1) * width],
          map[x + (y - 1) * width],
          map[x - 1 + y * width],
          map[x + y * width],
        ),
      });
    }
  }

  return elements;
}

/*------*/

export type BitNumber = 0 | 1;

export interface GenerateBitAutotileSubTile {
  (mask: number): ImageWithDepth<any>;
}

export interface AssembleBitAutotileOptions
  extends Omit<AssembleAutotileOptions, 'generate' | 'map'> {
  readonly generate: GenerateBitAutotileSubTile;
  readonly map: ArrayLike<BitNumber>;
}

export function assembleBitAutotile(
  { tileSize, generate, width, height, z, map }: AssembleBitAutotileOptions,
  elements: RendererImageElement[] = [],
): RendererImageElement[] {
  for (let y0: number = 0, y1: number = 1; y1 < height; y0++, y1++) {
    for (let x0: number = 0, x1: number = 1; x1 < width; x0++, x1++) {
      elements.push({
        x: (x0 + 0.5) * tileSize,
        y: (y0 + 0.5) * tileSize,
        z,
        image: generate(
          map[x0 + y0 * width] |
            (map[x1 + y0 * width] << 1) |
            (map[x0 + y1 * width] << 2) |
            (map[x1 + y1 * width] << 3),
        ),
      });
    }
  }

  return elements;
}
