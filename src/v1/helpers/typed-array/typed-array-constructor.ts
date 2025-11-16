import { type InferTypedArrayBuffer, type TypedArray } from './typed-array';

export interface TypedArrayConstructor<GTypedArray extends TypedArray<any>> {
  new (length: number): GTypedArray;
  new (array: ArrayLike<number>): GTypedArray;
  new (
    buffer: InferTypedArrayBuffer<GTypedArray>,
    byteOffset?: number,
    length?: number,
  ): GTypedArray;

  readonly BYTES_PER_ELEMENT: number;

  // /**
  //  * Returns a new array from a set of elements.
  //  * @param items A set of elements to include in the new array object.
  //  */
  // of(...items: number[]): Uint8Array<ArrayBuffer>;
  //
  // /**
  //  * Creates an array from an array-like or iterable object.
  //  * @param arrayLike An array-like object to convert to an array.
  //  */
  // from(arrayLike: ArrayLike<number>): Uint8Array<ArrayBuffer>;
  //
  // /**
  //  * Creates an array from an array-like or iterable object.
  //  * @param arrayLike An array-like object to convert to an array.
  //  * @param mapfn A mapping function to call on every element of the array.
  //  * @param thisArg Value of 'this' used to invoke the mapfn.
  //  */
  // from<T>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => number, thisArg?: any): Uint8Array<ArrayBuffer>;
}
