import { Data2d, type Data2dGetData, type Data2dSetData } from './data-2d';

export class Data2dView extends Data2d {
  readonly #source: Data2d;
  readonly #x: number;
  readonly #y: number;

  constructor(source: Data2d, x: number, y: number, width: number, height: number) {
    super(width, height);

    this.#source = source;
    this.#x = x;
    this.#y = y;
  }

  override get(x: number, y: number): Uint8Array;
  override get<GOutput extends Data2dGetData>(x: number, y: number, output: GOutput): GOutput;
  override get<GOutput extends Data2dGetData>(
    x: number,
    y: number,
    output?: GOutput,
  ): GOutput | Uint8Array {
    const sx: number = this.#x + x;
    const sy: number = this.#y + y;

    if (0 <= sx && x < this.#source.width && 0 <= sy && sy < this.#source.height) {
      return this.#source.get<GOutput>(sx, sy, output as any);
    } else {
      if (output === undefined) {
        return new Uint8Array(this.bytesPerBlock);
      } else {
        for (let i: number = 0; i < this.bytesPerBlock; i++) {
          output[i] = 0;
        }
        return output;
      }
    }
  }

  override set(x: number, y: number, data: Data2dSetData): void {
    const sx: number = this.#x + x;
    const sy: number = this.#y + y;

    if (0 <= sx && x < this.#source.width && 0 <= sy && sy < this.#source.height) {
      this.#source.set(sx, sy, data);
    }
  }
}
