export type GetUintNArrayConstructorFittingRangeReturn =
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor;

export function getUintNArrayConstructorFittingRange(
  range: number,
): GetUintNArrayConstructorFittingRangeReturn {
  if (range <= 0xff) {
    return Uint8Array;
  } else if (range <= 0xffff) {
    return Uint16Array;
  } else {
    return Uint32Array;
  }
}
