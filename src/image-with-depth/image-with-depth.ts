import { type TypedArray } from '../helpers/typed-array/typed-array';
import { TypedArrayConstructor } from '../helpers/typed-array/typed-array-constructor';

export type ImageWithDepthDefaultDepthType = Uint16Array;

export class ImageWithDepth<GDepthArrayType extends TypedArray> {
  // static fromImageData(
  //   imageData: ImageData,
  //   depth?: undefined,
  // ): ImageWithDepth<ImageWithDepthDefaultDepthType>;
  // static fromImageData<GDepth extends ImageWithDepthDepthArrayType>(
  //   imageData: ImageData,
  //   depth: GDepth,
  // ): ImageWithDepth<GDepth>;
  // static fromImageData<GDepth extends ImageWithDepthDepthArrayType>(
  //   imageData: ImageData,
  //   depth: GDepth,
  // ): ImageWithDepth<GDepth> {
  //   return this.new<GDepth>(imageData.width, imageData.height, imageData.data, depth);
  // }

  // static new(
  //   width: number,
  //   height: number,
  //   data?: Uint8ClampedArray,
  //   depth?: undefined,
  // ): ImageWithDepth<ImageWithDepthDefaultDepthType>;
  // static new<GDepth extends ImageWithDepthDepthType>(
  //   width: number,
  //   height: number,
  //   data: Uint8ClampedArray | undefined,
  //   depth: GDepth,
  // ): ImageWithDepth<GDepth>;
  // static new<GDepth extends ImageWithDepthDepthType>(
  //   width: number,
  //   height: number,
  //   data: Uint8ClampedArray | undefined = new Uint8ClampedArray(width * height * 4),
  //   depth: GDepth | undefined = new Uint16Array(
  //     width * height,
  //   ) satisfies ImageWithDepthDefaultDepthType as GDepth,
  // ): ImageWithDepth<GDepth> {
  //   return new ImageWithDepth(width, height, data, depth);
  // }

  static fromImageData<GDepthArrayType extends TypedArray>(
    imageData: ImageData,
    ctor: TypedArrayConstructor<GDepthArrayType>,
  ): ImageWithDepth<GDepthArrayType> {
    return new ImageWithDepth<GDepthArrayType>(
      imageData.width,
      imageData.height,
      imageData.data,
      new ctor(imageData.width * imageData.height),
    );
  }

  static new<GDepthArrayType extends TypedArray>(
    width: number,
    height: number,
    ctor: TypedArrayConstructor<GDepthArrayType>,
  ): ImageWithDepth<GDepthArrayType> {
    return new ImageWithDepth<GDepthArrayType>(
      width,
      height,
      new Uint8ClampedArray(width * height * 4),
      new ctor(width * height),
    );
  }

  readonly width: number;
  readonly height: number;

  readonly color: Uint8ClampedArray;
  readonly depth: GDepthArrayType;

  constructor(width: number, height: number, color: Uint8ClampedArray, depth: GDepthArrayType) {
    const depthLength: number = width * height;
    const colorLength: number = depthLength * 4;

    if (color.length !== colorLength) {
      throw new Error(`"color" should have a length of ${colorLength} (width * height * 4)`);
    }

    if (depth.length !== depthLength) {
      throw new Error(`"depth" should have a length of ${depthLength} (width * height)`);
    }

    this.width = width;
    this.height = height;
    this.color = color;
    this.depth = depth;
  }

  cut(x: number, y: number, width: number, height: number): ImageWithDepth<GDepthArrayType> {
    const x_start: number = Math.max(0, Math.min(this.width, x));
    const y_start: number = Math.max(0, Math.min(this.height, y));
    const x_end: number = Math.max(0, Math.min(this.width, x + width));
    const y_end: number = Math.max(0, Math.min(this.height, y + height));

    const output: ImageWithDepth<GDepthArrayType> = ImageWithDepth.new<GDepthArrayType>(
      x_end - x_start,
      y_end - y_start,
      this.depth.constructor as TypedArrayConstructor<GDepthArrayType>,
    );

    for (let y_current: number = y_start; y_current < y_end; y_current++) {
      for (let x_current: number = x_start; x_current < x_end; x_current++) {
        const inputIndex: number = x_current + y_current * this.width;
        const inputColorIndex: number = inputIndex * 4;
        const inputDepthIndex: number = inputIndex;

        const outputIndex: number = x_current - x_start + (y_current - y_start) * output.width;
        const outputColorIndex: number = outputIndex * 4;
        const outputDepthIndex: number = outputIndex;

        for (let i: number = 0; i < 4; i++) {
          output.color[outputColorIndex + i] = this.color[inputColorIndex + i];
        }

        output.depth[outputDepthIndex] = this.depth[inputDepthIndex];
      }
    }

    return output;
  }
}
