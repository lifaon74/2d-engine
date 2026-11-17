import { Data2d, type Data2dConstructor, type Data2dGetData, type Data2dSetData } from '../data-2d';

export class Uint8Array2d extends Data2d {
  static override fromUrl(url: URL | string): Promise<Uint8Array2d>;
  static override fromUrl<GData2d extends Data2d>(
    url: URL | string,
    ctor: Data2dConstructor<GData2d>,
  ): Promise<GData2d>;
  static override fromUrl<GData2d extends Data2d>(
    url: URL | string,
    ctor: Data2dConstructor<GData2d | Uint8Array2d> = Uint8Array2d,
  ): Promise<GData2d | Uint8Array2d> {
    return super.fromUrl<GData2d | Uint8Array2d>(url, ctor);
  }

  static override async fromImageElement(imageElement: HTMLImageElement): Promise<Uint8Array2d>;
  static override async fromImageElement<GData2d extends Data2d>(
    imageElement: HTMLImageElement,
    ctor: Data2dConstructor<GData2d>,
  ): Promise<GData2d>;
  static override async fromImageElement<GData2d extends Data2d>(
    imageElement: HTMLImageElement,
    ctor: Data2dConstructor<GData2d | Uint8Array2d> = Uint8Array2d,
  ): Promise<GData2d | Uint8Array2d> {
    return super.fromImageElement<GData2d | Uint8Array2d>(imageElement, ctor);
  }

  static override fromImageData(imageData: ImageData): Uint8Array2d;
  static override fromImageData<GData2d extends Data2d>(
    imageData: ImageData,
    ctor: Data2dConstructor<GData2d>,
  ): GData2d;
  static override fromImageData<GData2d extends Data2d>(
    imageData: ImageData,
    ctor: Data2dConstructor<GData2d | Uint8Array2d> = Uint8Array2d,
  ): GData2d | Uint8Array2d {
    return ctor === Uint8Array2d ?
        new Uint8Array2d(
          imageData.width,
          imageData.height,
          4,
          new Uint8Array(
            imageData.data.buffer,
            imageData.data.byteOffset,
            imageData.data.byteLength,
          ),
        )
      : super.fromImageData<GData2d | Uint8Array2d>(imageData, ctor);
  }

  readonly #data: Uint8Array;

  constructor(
    width: number,
    height: number,
    bytesPerBlock: number = 4,
    data: Uint8Array = new Uint8Array(width * height * bytesPerBlock),
  ) {
    if (data.length !== width * height * bytesPerBlock) {
      throw new Error(
        `"data" should have a length of ${width * height * bytesPerBlock} (width * height * bytesPerBlock)`,
      );
    }

    super(width, height, bytesPerBlock);

    this.#data = data;
  }

  get data(): Uint8Array {
    return this.#data;
  }

  override get(x: number, y: number): Uint8Array;
  override get<GOutput extends Data2dGetData>(x: number, y: number, output: GOutput): GOutput;
  override get<GOutput extends Data2dGetData>(
    x: number,
    y: number,
    output?: GOutput,
  ): GOutput | Uint8Array {
    const index: number = (x + y * this.width) * this.bytesPerBlock;

    if (output === undefined) {
      return this.#data.subarray(index, index + this.bytesPerBlock);
    } else {
      for (let i: number = 0; i < this.bytesPerBlock; i++) {
        output[i] = this.#data[index + i];
      }

      return output;
    }
  }

  override set(x: number, y: number, data: Data2dSetData): void {
    if (data.length !== this.bytesPerBlock) {
      throw new Error(`"data" should have a length of ${this.bytesPerBlock}`);
    }

    const index: number = (x + y * this.width) * this.bytesPerBlock;

    this.#data.set(data, index);
  }

  /* OPERATIONS */

  override clear(): this {
    this.#data.fill(0);
    return this;
  }

  override cut(x: number, y: number, width: number, height: number): Uint8Array2d;
  override cut<GData2d extends Data2d>(
    x: number,
    y: number,
    width: number,
    height: number,
    ctor: Data2dConstructor<GData2d>,
  ): GData2d;
  override cut<GData2d extends Data2d>(
    x: number,
    y: number,
    width: number,
    height: number,
    ctor: Data2dConstructor<GData2d | Uint8Array2d> = Uint8Array2d,
  ): GData2d | Uint8Array2d {
    return super.cut<GData2d | Uint8Array2d>(x, y, width, height, ctor);
  }

  /* TO */

  override toImageData(): ImageData {
    if (this.bytesPerBlock !== 4) {
      throw new Error(`"bytesPerBlock" should be 4`);
    }

    return new ImageData(
      new Uint8ClampedArray(this.#data.buffer, this.#data.byteOffset, this.#data.byteLength),
      this.width,
      this.height,
    );
  }
}
