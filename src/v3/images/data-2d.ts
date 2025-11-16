export type Data2dConstructor<GData2d extends Data2d> = {
  new (width: number, height: number, bytesPerBlock: number): GData2d;
};

// export abstract class Data2dFactory<GConstructor extends > {
//   fromUrl(url: URL | string): Promise<Data2d> {
//     const img: HTMLImageElement = new Image();
//     img.src = url.toString();
//     return this.fromImageElement(img);
//   }
//
//   async fromImageElement(imageElement: HTMLImageElement): Promise<Data2d> {
//     await imageElement.decode();
//     const ctx: CanvasRenderingContext2D = createCanvasRenderingContext2d(
//       imageElement.naturalWidth,
//       imageElement.naturalHeight,
//     );
//     ctx.drawImage(imageElement, 0, 0);
//     return this.fromImageData(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
//   }
//
//   fromImageData(imageData: ImageData): Data2d {
//     return new Data2d(
//       imageData.width,
//       imageData.height,
//       new Uint8Array(imageData.data.buffer, imageData.data.byteOffset, imageData.data.byteLength),
//       4,
//     );
//   }
// }

// export interface Data2dGetFunction {
//   (x: number, y: number): Uint8Array;
//   <GOutput extends Data2dGetData>(x: number, y: number, output: GOutput): GOutput;
// }

export interface Data2dGetData {
  readonly length: number;
  [index: number]: number;
}

export interface Data2dSetData {
  readonly length: number;
  readonly [index: number]: number;
}

export abstract class Data2d {
  static fromUrl<GData2d extends Data2d>(
    url: URL | string,
    ctor: Data2dConstructor<GData2d>,
  ): Promise<GData2d> {
    const img: HTMLImageElement = new Image();
    img.src = url.toString();
    return this.fromImageElement<GData2d>(img, ctor);
  }

  static async fromImageElement<GData2d extends Data2d>(
    imageElement: HTMLImageElement,
    ctor: Data2dConstructor<GData2d>,
  ): Promise<GData2d> {
    await imageElement.decode();
    // const canvas: HTMLCanvasElement = document.createElement('canvas');
    // canvas.width = imageElement.naturalWidth;
    // canvas.height = imageElement.naturalHeight;
    const canvas: OffscreenCanvas = new OffscreenCanvas(
      imageElement.naturalWidth,
      imageElement.naturalHeight,
    );
    const ctx: OffscreenCanvasRenderingContext2D = canvas.getContext('2d')!;
    ctx.drawImage(imageElement, 0, 0);
    return this.fromImageData<GData2d>(
      ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
      ctor,
    );
  }

  static fromImageData<GData2d extends Data2d>(
    imageData: ImageData,
    ctor: Data2dConstructor<GData2d>,
  ): GData2d {
    const image: GData2d = new ctor(imageData.width, imageData.height, 4);
    let index: number = 0;

    for (let y: number = 0; y < imageData.height; y++) {
      for (let x: number = 0; x < imageData.width; x++) {
        image.set(x, y, imageData.data.subarray(index, index + 4));
        index += 4;
      }
    }

    return image;
  }

  readonly #width: number;
  readonly #height: number;
  readonly #bytesPerBlock: number;

  constructor(width: number, height: number, bytesPerBlock: number = 4) {
    // if (!Number.isSafeInteger(width) || width < 0) {
    //   throw new Error('"width" should be a positive integer');
    // }
    // if (!Number.isSafeInteger(height) || height < 0) {
    //   throw new Error('"height" should be a positive integer');
    // }
    // if (!Number.isSafeInteger(bytesPerBlock) || bytesPerBlock < 0) {
    //   throw new Error('"bytesPerBlock" should be a positive integer');
    // }
    this.#width = width;
    this.#height = height;
    this.#bytesPerBlock = bytesPerBlock;
  }

  get width(): number {
    return this.#width;
  }

  get height(): number {
    return this.#height;
  }

  get bytesPerBlock(): number {
    return this.#bytesPerBlock;
  }

  abstract get(x: number, y: number): Uint8Array;
  abstract get<GOutput extends Data2dGetData>(x: number, y: number, output: GOutput): GOutput;

  abstract set(x: number, y: number, data: Data2dSetData): void;

  /* OPERATIONS */

  fill(data: Data2dSetData): this {
    for (let y: number = 0; y < this.#height; y++) {
      for (let x: number = 0; x < this.#width; x++) {
        this.set(x, y, data);
      }
    }

    return this;
  }

  cut<GData2d extends Data2d>(
    x: number,
    y: number,
    width: number,
    height: number,
    ctor: Data2dConstructor<GData2d>,
  ): GData2d {
    width = Math.max(0, width);
    height = Math.max(0, height);

    const inputStartX: number = Math.max(0, Math.min(this.#width, x));
    const inputStartY: number = Math.max(0, Math.min(this.#height, y));
    const inputEndX: number = Math.max(0, Math.min(this.#width, x + width));
    const inputEndY: number = Math.max(0, Math.min(this.#height, y + height));
    const outputStartX: number = inputStartX - x;
    const outputStartY: number = inputStartY - y;

    const output: GData2d = new ctor(width, height, this.#bytesPerBlock);

    for (
      let inputY: number = inputStartY, outputY: number = outputStartY;
      inputY < inputEndY;
      inputY++, outputY++
    ) {
      for (
        let inputX: number = inputStartX, outputX: number = outputStartX;
        inputX < inputEndX;
        inputX++, outputX++
      ) {
        output.set(outputX, outputY, this.get(inputX, inputY));
      }
    }

    return output;
  }

  /**
   * Puts a `Data2d` on this `Data2d`
   * @param source the `Data2d` to draw
   * @param destinationX the _x_ position where to place `source`
   * @param destinationY the _y_ position where to place `source`
   * @param sourceX the _x_ position on the `source` where we start to draw
   * @param sourceY the _y_ position on the `source` where we start to draw
   * @param sourceWidth the _width_ we draw from `source`'s _x_
   * @param sourceHeight the _height_ we draw from `source`'s _y_
   */
  put(
    source: Data2d,
    destinationX: number,
    destinationY: number,
    sourceX: number = 0,
    sourceY: number = 0,
    sourceWidth: number = source.#width,
    sourceHeight: number = source.#height,
  ): this {
    if (source.#bytesPerBlock !== this.#bytesPerBlock) {
      throw new Error(`"source.bytesPerBlock" should be ${this.#bytesPerBlock}`);
    }

    destinationX = Math.max(0, Math.min(this.#width, destinationX));
    destinationY = Math.max(0, Math.min(this.#height, destinationY));

    sourceX = Math.max(0, Math.min(source.#width, this.#width - destinationX, sourceX));
    sourceY = Math.max(0, Math.min(source.#height, this.#height - destinationY, sourceY));

    sourceWidth = Math.max(0, Math.min(this.#width - destinationX - sourceX, sourceWidth));
    sourceHeight = Math.max(0, Math.min(this.#height - destinationY - sourceY, sourceHeight));

    for (
      let currentSourceY: number = sourceY, currentDestinationY: number = destinationY;
      currentSourceY < sourceHeight;
      currentSourceY++, currentDestinationY++
    ) {
      for (
        let currentSourceX: number = sourceX, currentDestinationX: number = destinationX;
        currentSourceX < sourceWidth;
        currentSourceX++, currentDestinationX++
      ) {
        this.set(
          currentDestinationX,
          currentDestinationY,
          source.get(currentSourceX, currentSourceY),
        );
      }
    }

    return this;
  }

  /*--*/

  increaseBytesPerBlock<GData2d extends Data2d>(
    bytesPerBlock: number,
    fillExtraData: <GOutput extends Data2dGetData>(x: number, y: number, output: GOutput) => void,
    ctor: Data2dConstructor<GData2d>,
  ): void {
    if (bytesPerBlock <= this.#bytesPerBlock) {
      throw new Error(`"bytesPerBlock" should be greater than ${this.#bytesPerBlock}`);
    }
    const buffer = new ArrayBuffer(bytesPerBlock);
    const sourceBufferView: Uint8Array = new Uint8Array(buffer, 0, this.#bytesPerBlock);
    const outputBufferView: Uint8Array = new Uint8Array(buffer, 0, bytesPerBlock);
    const outputExtraBufferView: Uint8Array = new Uint8Array(
      buffer,
      this.#bytesPerBlock,
      bytesPerBlock - this.#bytesPerBlock,
    );
    const output: GData2d = new ctor(this.#width, this.#height, bytesPerBlock);

    for (let y: number = 0; y < this.#height; y++) {
      for (let x: number = 0; x < this.#height; x++) {
        this.get(x, y, sourceBufferView);
        fillExtraData(x, y, outputExtraBufferView);
        output.set(x, y, outputBufferView);
      }
    }
  }

  /* TO */

  toImageData(): ImageData {
    if (this.#bytesPerBlock !== 4) {
      throw new Error(`"bytesPerBlock" should be 4`);
    }

    const imageData: ImageData = new ImageData(this.#width, this.#height);

    let i: number = 0;
    for (let y: number = 0; y < this.#height; y++) {
      for (let x: number = 0; x < this.#width; x++) {
        this.get(x, y, imageData.data.subarray(i, i + 4));
        // imageData.data.set(this.get(x, y), i);
        i += 4;
      }
    }

    return imageData;
  }

  toCanvas(): HTMLCanvasElement {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = this.#width;
    canvas.height = this.#height;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    ctx.putImageData(this.toImageData(), 0, 0);
    return canvas;
  }

  display(scale: number = 1): this {
    const canvas: HTMLCanvasElement = this.toCanvas();
    canvas.style.border = `2px solid black`;
    canvas.style.margin = `32px`;
    canvas.style.imageRendering = 'pixelated';
    canvas.style.width = `${canvas.width * scale}px`;
    canvas.style.height = `${canvas.height * scale}px`;
    document.body.appendChild(canvas);
    return this;
  }

  download(fileName: string): this {
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = this.toCanvas().toDataURL();
    a.download = fileName;
    a.click();
    return this;
  }
}
