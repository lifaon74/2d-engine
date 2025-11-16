export type TypedArray<GArrayBuffer extends ArrayBufferLike = ArrayBufferLike> =
  | Uint8ClampedArray<GArrayBuffer>
  | Uint8Array<GArrayBuffer>
  | Uint16Array<GArrayBuffer>
  | Uint32Array<GArrayBuffer>
  | Int8Array<GArrayBuffer>
  | Int16Array<GArrayBuffer>
  | Int32Array<GArrayBuffer>
  | Float16Array<GArrayBuffer>
  | Float32Array<GArrayBuffer>
  | Float64Array<GArrayBuffer>;

export type InferTypedArrayBuffer<GTypedArray extends TypedArray<any>> =
  GTypedArray extends TypedArray<infer GArrayBuffer> ? GArrayBuffer : never;
