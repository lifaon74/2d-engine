import { Image2d, Image2dConstructor, Image2dGetData, Image2dSetData } from '../image-2d';

export class DataImage2d extends Image2d {
  static override fromUrl(url: URL | string): Promise<DataImage2d>;
  static override fromUrl<GImage2d extends Image2d>(
    url: URL | string,
    ctor: Image2dConstructor<GImage2d>,
  ): Promise<GImage2d>;
  static override fromUrl<GImage2d extends Image2d>(
    url: URL | string,
    ctor: Image2dConstructor<GImage2d | DataImage2d> = DataImage2d,
  ): Promise<GImage2d | DataImage2d> {
    return super.fromUrl<GImage2d | DataImage2d>(url, ctor);
  }

  static override async fromImageElement(imageElement: HTMLImageElement): Promise<DataImage2d>;
  static override async fromImageElement<GImage2d extends Image2d>(
    imageElement: HTMLImageElement,
    ctor: Image2dConstructor<GImage2d>,
  ): Promise<GImage2d>;
  static override async fromImageElement<GImage2d extends Image2d>(
    imageElement: HTMLImageElement,
    ctor: Image2dConstructor<GImage2d | DataImage2d> = DataImage2d,
  ): Promise<GImage2d | DataImage2d> {
    return super.fromImageElement<GImage2d | DataImage2d>(imageElement, ctor);
  }

  static override fromImageData(imageData: ImageData): DataImage2d;
  static override fromImageData<GImage2d extends Image2d>(
    imageData: ImageData,
    ctor: Image2dConstructor<GImage2d>,
  ): GImage2d;
  static override fromImageData<GImage2d extends Image2d>(
    imageData: ImageData,
    ctor: Image2dConstructor<GImage2d | DataImage2d> = DataImage2d,
  ): GImage2d | DataImage2d {
    return ctor === DataImage2d ?
        new DataImage2d(
          imageData.width,
          imageData.height,
          4,
          new Uint8Array(
            imageData.data.buffer,
            imageData.data.byteOffset,
            imageData.data.byteLength,
          ),
        )
      : super.fromImageData<GImage2d | DataImage2d>(imageData, ctor);
  }

  readonly #data: Uint8Array;

  constructor(
    width: number,
    height: number,
    bytesPerPixel: number = 4,
    data: Uint8Array = new Uint8Array(width * height * bytesPerPixel),
  ) {
    if (data.length !== width * height * bytesPerPixel) {
      throw new Error(
        `"data" should have a length of ${width * height * bytesPerPixel} (width * height * bytesPerPixel)`,
      );
    }

    super(width, height, bytesPerPixel);

    this.#data = data;
  }

  get data(): Uint8Array {
    return this.#data;
  }

  get(x: number, y: number): Uint8Array;
  get<GOutput extends Image2dGetData>(x: number, y: number, output: GOutput): GOutput;
  get<GOutput extends Image2dGetData>(
    x: number,
    y: number,
    output?: GOutput,
  ): GOutput | Uint8Array {
    const index: number = (x + y * this.width) * this.bytesPerPixel;

    if (output === undefined) {
      return this.#data.subarray(index, index + this.bytesPerPixel);
    } else {
      for (let i: number = 0; i < this.bytesPerPixel; i++) {
        output[i] = this.#data[index + i];
      }

      return output;
    }
  }

  set(x: number, y: number, data: Image2dSetData): void {
    if (data.length !== this.bytesPerPixel) {
      throw new Error(`"data" should have a length of ${this.bytesPerPixel}`);
    }

    const index: number = (x + y * this.width) * this.bytesPerPixel;

    this.#data.set(data, index);
  }

  /* OPERATIONS */

  override cut(x: number, y: number, width: number, height: number): DataImage2d;
  override cut<GImage2d extends Image2d>(
    x: number,
    y: number,
    width: number,
    height: number,
    ctor: Image2dConstructor<GImage2d>,
  ): GImage2d;
  override cut<GImage2d extends Image2d>(
    x: number,
    y: number,
    width: number,
    height: number,
    ctor: Image2dConstructor<GImage2d | DataImage2d> = DataImage2d,
  ): GImage2d | DataImage2d {
    return super.cut<GImage2d | DataImage2d>(x, y, width, height, ctor);
  }

  /* TO */

  override toImageData(): ImageData {
    if (this.bytesPerPixel !== 4) {
      throw new Error(`"bytesPerPixel" should be 4`);
    }

    return new ImageData(
      new Uint8ClampedArray(
        this.#data.buffer,
        this.#data.byteOffset,
        this.#data.byteLength,
      ) as ImageDataArray,
      this.width,
      this.height,
    );
  }
}
