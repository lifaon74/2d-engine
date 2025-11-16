import { createCanvasRenderingContext2d } from '../helpers/create-canvas-rendering-context-2d';

export type Image2dConstructor<GImage2d extends Image2d> = {
  new (width: number, height: number, bytesPerPixel: number): GImage2d;
};

// export abstract class Image2dFactory<GConstructor extends > {
//   fromUrl(url: URL | string): Promise<Image2d> {
//     const img: HTMLImageElement = new Image();
//     img.src = url.toString();
//     return this.fromImageElement(img);
//   }
//
//   async fromImageElement(imageElement: HTMLImageElement): Promise<Image2d> {
//     await imageElement.decode();
//     const ctx: CanvasRenderingContext2D = createCanvasRenderingContext2d(
//       imageElement.naturalWidth,
//       imageElement.naturalHeight,
//     );
//     ctx.drawImage(imageElement, 0, 0);
//     return this.fromImageData(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
//   }
//
//   fromImageData(imageData: ImageData): Image2d {
//     return new Image2d(
//       imageData.width,
//       imageData.height,
//       new Uint8Array(imageData.data.buffer, imageData.data.byteOffset, imageData.data.byteLength),
//       4,
//     );
//   }
// }

// export interface Image2dGetFunction {
//   (x: number, y: number): Uint8Array;
//   <GOutput extends Image2dGetData>(x: number, y: number, output: GOutput): GOutput;
// }

export interface Image2dGetData {
  readonly length: number;
  [index: number]: number;
}

export interface Image2dSetData {
  readonly length: number;
  readonly [index: number]: number;
}

export abstract class Image2d {
  static fromUrl<GImage2d extends Image2d>(
    url: URL | string,
    ctor: Image2dConstructor<GImage2d>,
  ): Promise<GImage2d> {
    const img: HTMLImageElement = new Image();
    img.src = url.toString();
    return this.fromImageElement<GImage2d>(img, ctor);
  }

  static async fromImageElement<GImage2d extends Image2d>(
    imageElement: HTMLImageElement,
    ctor: Image2dConstructor<GImage2d>,
  ): Promise<GImage2d> {
    await imageElement.decode();
    const ctx: CanvasRenderingContext2D = createCanvasRenderingContext2d(
      imageElement.naturalWidth,
      imageElement.naturalHeight,
    );
    ctx.drawImage(imageElement, 0, 0);
    return this.fromImageData<GImage2d>(
      ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height),
      ctor,
    );
  }

  static fromImageData<GImage2d extends Image2d>(
    imageData: ImageData,
    ctor: Image2dConstructor<GImage2d>,
  ): GImage2d {
    const image: GImage2d = new ctor(imageData.width, imageData.height, 4);
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
  readonly #bytesPerPixel: number;

  constructor(width: number, height: number, bytesPerPixel: number = 4) {
    this.#width = width;
    this.#height = height;
    this.#bytesPerPixel = bytesPerPixel;
  }

  get width(): number {
    return this.#width;
  }

  get height(): number {
    return this.#height;
  }

  get bytesPerPixel(): number {
    return this.#bytesPerPixel;
  }

  abstract get(x: number, y: number): Uint8Array;
  abstract get<GOutput extends Image2dGetData>(x: number, y: number, output: GOutput): GOutput;

  abstract set(x: number, y: number, data: Image2dSetData): void;

  /* OPERATIONS */

  fill(data: Image2dSetData): this {
    for (let y: number = 0; y < this.#height; y++) {
      for (let x: number = 0; x < this.#width; x++) {
        this.set(x, y, data);
      }
    }

    return this;
  }

  cut<GImage2d extends Image2d>(
    x: number,
    y: number,
    width: number,
    height: number,
    ctor: Image2dConstructor<GImage2d>,
  ): GImage2d {
    width = Math.max(0, width);
    height = Math.max(0, height);

    const inputStartX: number = Math.max(0, Math.min(this.#width, x));
    const inputStartY: number = Math.max(0, Math.min(this.#height, y));
    const inputEndX: number = Math.max(0, Math.min(this.#width, x + width));
    const inputEndY: number = Math.max(0, Math.min(this.#height, y + height));
    const outputStartX: number = inputStartX - x;
    const outputStartY: number = inputStartY - y;

    const output: GImage2d = new ctor(width, height, this.#bytesPerPixel);

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
   * Puts a `Image2d` on this `Image2d`
   * @param source the `Image2d` to draw
   * @param destinationX the _x_ position where to place `source`
   * @param destinationY the _y_ position where to place `source`
   * @param sourceX the _x_ position on the `source` where we start to draw
   * @param sourceY the _y_ position on the `source` where we start to draw
   * @param sourceWidth the _width_ we draw from `source`'s _x_
   * @param sourceHeight the _height_ we draw from `source`'s _y_
   */
  put(
    source: Image2d,
    destinationX: number,
    destinationY: number,
    sourceX: number = 0,
    sourceY: number = 0,
    sourceWidth: number = source.#width,
    sourceHeight: number = source.#height,
  ): this {
    if (source.#bytesPerPixel !== this.#bytesPerPixel) {
      throw new Error(`"source.bytesPerPixel" should be ${this.#bytesPerPixel}`);
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

  /* TO */

  toImageData(): ImageData {
    if (this.#bytesPerPixel !== 4) {
      throw new Error(`"bytesPerPixel" should be 4`);
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
