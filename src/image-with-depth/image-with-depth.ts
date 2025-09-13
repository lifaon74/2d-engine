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
}
