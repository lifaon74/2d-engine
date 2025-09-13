import { getUintNArrayConstructorFittingRange } from '../helpers/typed-array/get-uint-n-array-constructor-fitting-range';
import { ImageWithDepth } from '../image-with-depth/image-with-depth';

export interface RendererImageElement {
  readonly x: number /* int32 */;
  readonly y: number /* int32 */;
  readonly z: number /* int32 */;
  readonly image: ImageWithDepth<any>;
}

const NUMBER_MIN_INT32: number = -2_147_483_648; /* 0x8000_0000 | 0 */
const NUMBER_MAX_INT32: number = 2_147_483_647; /* 0x7fff_ffff */

export class CPUImageRendererLayer {
  readonly color: Uint8ClampedArray;
  readonly depth: Int32Array;

  constructor(width: number, height: number) {
    this.color = new Uint8ClampedArray(width * height * 4);
    this.depth = new Int32Array(width * height);
  }

  // getMinDepth(): number {
  //   let min: number = NUMBER_MAX_INT32;
  //   for (let i: number = 0; i < this.depth.length; i++) {
  //     min = Math.min(min, this.depth[i]);
  //   }
  //   return min;
  // }
  //
  // getMaxDepth(): number {
  //   let max: number = NUMBER_MIN_INT32;
  //   for (let i: number = 0; i < this.depth.length; i++) {
  //     max = Math.max(max, this.depth[i]);
  //   }
  //   return max;
  // }

  replacePixel(
    sourceIndex: number,
    sourceColor: Uint8ClampedArray,
    sourceDepth: Int32Array,
    destinationIndex: number,
  ): void {
    const sourceColorIndex: number = sourceIndex * 4;
    const destinationColorIndex: number = destinationIndex * 4;

    for (let i: number = 0; i < 4; i++) {
      this.color[destinationColorIndex + i] = sourceColor[sourceColorIndex + i];
    }

    this.depth[destinationIndex] = sourceDepth[sourceIndex];
  }

  replacePixelWithAnotherLayersPixelAtTheSameIndex(
    source: CPUImageRendererLayer,
    index: number,
  ): void {
    this.replacePixel(index, source.color, source.depth, index);
  }

  blendPixel(sourceIndex: number, sourceColor: Uint8ClampedArray, destinationIndex: number): void {
    const sourceColorIndex: number = sourceIndex * 4;
    const destinationColorIndex: number = destinationIndex * 4;

    const alpha: number = 1 - sourceColor[sourceColorIndex + 3] / 0xff;

    for (let i: number = 0; i < 4; i++) {
      this.color[destinationColorIndex + i] =
        this.color[destinationColorIndex + i] * alpha + sourceColor[sourceColorIndex + i];
    }
  }

  clear(): void {
    this.color.fill(0);
    this.depth.fill(NUMBER_MIN_INT32);
  }
}

export class CPUImageRenderer {
  readonly #width: number;
  readonly #height: number;
  #x: number /* int32 */;
  #y: number /* int32 */;

  #elements: readonly RendererImageElement[];

  readonly #opaqueLayer: CPUImageRendererLayer;

  /**
   * NOTE: the layers are sorted by depth, from the lowest to the highest
   * NOTE: the layers have depth always strictly greater than the opaque layer's depth (except for if the opaque layer is fully transparent)
   */
  readonly #transparentLayers: readonly CPUImageRendererLayer[];
  readonly #transparentLayersStartIndexes: Uint8Array;
  readonly #transparentLayersEndIndexes: Uint8Array;

  readonly #output: ImageData;

  constructor(width: number, height: number) {
    this.#width = width;
    this.#height = height;

    this.#x = 0;
    this.#y = 0;

    this.#elements = [];

    this.#opaqueLayer = new CPUImageRendererLayer(width, height);

    this.#transparentLayers = Array.from(
      { length: 8 },
      (): CPUImageRendererLayer => new CPUImageRendererLayer(width, height),
    );
    this.#transparentLayersStartIndexes = new Uint8Array(width * height);
    this.#transparentLayersEndIndexes = new Uint8Array(width * height);

    this.#output = new ImageData(width, height);
  }

  /* VIEW */

  get width(): number {
    return this.#width;
  }

  get height(): number {
    return this.#height;
  }

  get x(): number {
    return this.#x;
  }

  get y(): number {
    return this.#y;
  }

  setView(x: number, y: number): void {
    this.#x = x;
    this.#y = y;
  }

  /* ELEMENTS */

  get elements(): readonly RendererImageElement[] {
    return this.#elements;
  }

  setElements(value: readonly RendererImageElement[]) {
    this.#elements = value;
  }

  /* LAYERS */

  // get layers(): readonly ImageWithDepth[] {
  //   return this.#transparentLayers;
  // }

  #clearLayers(): void {
    this.#opaqueLayer.clear();

    const mid: number = Math.floor(this.#transparentLayers.length / 2);
    this.#transparentLayersStartIndexes.fill(mid);
    this.#transparentLayersEndIndexes.fill(mid);

    // for (let i: number = 0; i < this.#transparentLayers.length; i++) {
    //   this.#transparentLayers[i].clear();
    // }
  }

  /**
   * Returns the `index` of a `transparentLayer`, where `depth` should be inserted to keep them in order.
   *
   * All elements from and above the returned index must be shifted to the right.
   */
  #getTransparentLayerInsertIndex(viewportIndex: number, depth: number): number {
    let start: number = this.#transparentLayersStartIndexes[viewportIndex];
    let end: number = this.#transparentLayersEndIndexes[viewportIndex] - 1;

    while (start <= end) {
      const mid: number = Math.floor((start + end) / 2);

      const layerDepth: number = this.#transparentLayers[mid].depth[viewportIndex];

      if (layerDepth === depth) {
        start = mid;
        break;
      } else if (layerDepth < depth) {
        start = mid + 1;
      } else {
        end = mid - 1;
      }
    }

    return start;
  }

  #shiftTransparentLayer(viewportIndex: number, start: number, end: number, shift: number): void {
    if (shift > 0) {
      for (let i: number = end - 1; i >= start; i--) {
        this.#transparentLayers[i + shift].replacePixelWithAnotherLayersPixelAtTheSameIndex(
          this.#transparentLayers[i],
          viewportIndex,
        );
      }
    } else if (shift < 0) {
      for (let i: number = start; i < end; i++) {
        this.#transparentLayers[i + shift].replacePixelWithAnotherLayersPixelAtTheSameIndex(
          this.#transparentLayers[i],
          viewportIndex,
        );
      }
    }
  }

  renderLayers(): void {
    this.#clearLayers();

    const opaqueLayerColorArray: Uint8ClampedArray = this.#opaqueLayer.color;
    const opaqueLayerDepthArray: Int32Array = this.#opaqueLayer.depth;
    const transparentLayersMaxLength: number = this.#transparentLayers.length;

    for (let elementIndex: number = 0; elementIndex < this.#elements.length; elementIndex++) {
      const element: RendererImageElement = this.#elements[elementIndex];

      const elementColorArray: Uint8ClampedArray = element.image.color;
      const elementDepthArray: Int32Array = element.image.depth;

      const deltaX: number = element.x - this.#x;
      const viewportStartX: number = Math.max(0, Math.min(this.#width, deltaX));
      const viewportEndX: number = Math.max(0, Math.min(this.#width, deltaX + element.image.width));

      const deltaY: number = element.y - this.#y;
      const viewportStartY: number = Math.max(0, Math.min(this.#height, deltaY));
      const viewportEndY: number = Math.max(
        0,
        Math.min(this.#height, deltaY + element.image.height),
      );

      for (let viewportX: number = viewportStartX; viewportX < viewportEndX; viewportX++) {
        const elementX: number = viewportX - deltaX;

        for (let viewportY: number = viewportStartY; viewportY < viewportEndY; viewportY++) {
          const elementY: number = viewportY - deltaY;

          const viewportIndex: number = viewportX + viewportY * this.#width;
          const viewportColorIndex: number = viewportIndex * 4;
          const viewportDepthIndex: number = viewportIndex;

          const elementIndex: number = elementX + elementY * element.image.width;
          const elementColorIndex: number = elementIndex * 4;
          const elementDepthIndex: number = elementIndex;

          const elementAlpha: number = elementColorArray[elementColorIndex + 3];
          const elementDepth: number = element.z + elementDepthArray[elementDepthIndex];

          const opaqueLayerAlpha: number = opaqueLayerColorArray[viewportColorIndex + 3];
          const opaqueLayerDepth: number = opaqueLayerDepthArray[viewportDepthIndex];

          if (
            /* the element's pixel is fully transparent */
            elementAlpha === 0 ||
            /* the element's pixel is below the opaque-layer's pixel */
            (opaqueLayerAlpha !== 0 && elementDepth < opaqueLayerDepth)
          ) {
            // => skip pixel's rendering
            continue;
          }

          if (elementAlpha === 0xff) {
            // -> the element's pixel is opaque

            // update the opaque-layer's pixel
            this.#opaqueLayer.replacePixel(
              elementIndex,
              elementColorArray,
              elementDepthArray,
              viewportIndex,
            );

            // cleanup every transparent-layers that are below the new opaque-layer's depth
            this.#transparentLayersStartIndexes[viewportIndex] =
              this.#getTransparentLayerInsertIndex(viewportIndex, elementDepth);

            continue;
          }

          // -> the element's pixel is transparent

          if (
            /* the element's pixel has the same depth as the opaque-layer's pixel */ elementDepth ===
              opaqueLayerDepth &&
            /* the opaque-layer's pixel is not transparent */ opaqueLayerAlpha !== 0
          ) {
            // -> the element's pixel merges with the opaque-layer's pixel
            this.#opaqueLayer.blendPixel(elementIndex, elementColorArray, viewportIndex);

            continue;
          }

          // -> the element's pixel must be added to one of the transparent layers

          const transparentLayerStartIndex: number =
            this.#transparentLayersStartIndexes[viewportIndex];
          const transparentLayerEndIndex: number = this.#transparentLayersEndIndexes[viewportIndex];

          const transparentLayerInsertIndex: number = this.#getTransparentLayerInsertIndex(
            viewportIndex,
            elementDepth,
          );

          if (
            /* the insertion index is in range */ transparentLayerInsertIndex <
              transparentLayerEndIndex &&
            /* the element's pixel has the same depth as the transparent-layer's pixel */ this
              .#transparentLayers[transparentLayerInsertIndex].depth[viewportColorIndex] ===
              elementDepth
          ) {
            // -> the element's pixel merges with the transparent-layer's pixel
            this.#transparentLayers[transparentLayerInsertIndex].blendPixel(
              elementIndex,
              elementColorArray,
              viewportIndex,
            );

            continue;
          }

          // -> the element's pixel requires an insertion into one of the transparent layers

          const transparentLayerLength: number =
            transparentLayerEndIndex - transparentLayerStartIndex;

          if (transparentLayerLength === transparentLayersMaxLength) {
            console.warn('Not enough slots for this transparent pixel.');

            continue;
          }

          // check if there is less data to shift on the start or end side
          const shiftEndSide: boolean =
            transparentLayerEndIndex - transparentLayerInsertIndex <=
            transparentLayerEndIndex - transparentLayerInsertIndex;

          if (
            shiftEndSide &&
            /* there is space after the end */ transparentLayerEndIndex < transparentLayersMaxLength
          ) {
            // -> we may safely shift the transparent-layer's pixels to the right

            this.#transparentLayersEndIndexes[viewportIndex]++;

            this.#shiftTransparentLayer(
              viewportIndex,
              transparentLayerInsertIndex,
              transparentLayerEndIndex,
              1,
            );

            this.#transparentLayers[transparentLayerInsertIndex].replacePixel(
              elementIndex,
              elementColorArray,
              elementDepthArray,
              viewportIndex,
            );
          } else if (
            !shiftEndSide &&
            /* there is space before the start */ transparentLayerStartIndex > 0
          ) {
            // -> we may safely shift the transparent-layer's pixels to the left

            this.#transparentLayersStartIndexes[viewportIndex]--;

            this.#shiftTransparentLayer(
              viewportIndex,
              transparentLayerStartIndex,
              transparentLayerInsertIndex,
              -1,
            );

            this.#transparentLayers[transparentLayerInsertIndex - 1].replacePixel(
              elementIndex,
              elementColorArray,
              elementDepthArray,
              viewportIndex,
            );
          } else {
            // -> we must realign the transparent-layers

            const newTransparentLayerLength: number = transparentLayerLength + 1;
            const newTransparentLayerStartIndex: number = Math.floor(newTransparentLayerLength / 2);
            const newTransparentLayerEndIndex: number =
              newTransparentLayerStartIndex + newTransparentLayerLength;

            const shiftStart: number = newTransparentLayerStartIndex - transparentLayerStartIndex;

            this.#shiftTransparentLayer(
              viewportIndex,
              transparentLayerStartIndex,
              transparentLayerInsertIndex,
              shiftStart,
            );

            this.#shiftTransparentLayer(
              viewportIndex,
              transparentLayerInsertIndex,
              transparentLayerEndIndex,
              newTransparentLayerEndIndex - transparentLayerEndIndex,
            );

            this.#transparentLayers[transparentLayerInsertIndex + shiftStart].replacePixel(
              elementIndex,
              elementColorArray,
              elementDepthArray,
              viewportIndex,
            );
          }
        }
      }
    }
  }

  #extractOpaqueLayer(): RendererImageElement {
    let minDepth: number = NUMBER_MAX_INT32;
    let maxDepth: number = NUMBER_MIN_INT32;
    const depthArray: Int32Array = this.#opaqueLayer.depth;

    for (let i: number = 0; i < depthArray.length; i++) {
      minDepth = Math.min(minDepth, depthArray[i]);
      maxDepth = Math.max(maxDepth, depthArray[i]);
    }

    const newDepthArray: Uint8Array | Uint16Array | Uint32Array =
      new (getUintNArrayConstructorFittingRange(maxDepth - minDepth))(this.#width * this.#height);

    for (let i: number = 0; i < depthArray.length; i++) {
      newDepthArray[i] = depthArray[i] - minDepth;
    }

    return {
      x: this.#x,
      y: this.#y,
      z: minDepth,
      image: new ImageWithDepth(
        this.#width,
        this.#height,
        this.#opaqueLayer.color.slice(),
        newDepthArray,
      ),
    };
  }

  #extractTransparentLayers(): RendererImageElement[] {
    const numberOfPixels: number = this.#width * this.#height;
    const numberOfPixelsMul4: number = numberOfPixels * 4;

    let minTransparentLayersStartIndex: number = this.#transparentLayersStartIndexes.length;
    let maxTransparentLayersEndIndex: number = 0;

    for (let pixelIndex: number = 0; pixelIndex < numberOfPixels; pixelIndex++) {
      minTransparentLayersStartIndex = Math.min(
        minTransparentLayersStartIndex,
        this.#transparentLayersStartIndexes[pixelIndex],
      );
      maxTransparentLayersEndIndex = Math.max(
        maxTransparentLayersEndIndex,
        this.#transparentLayersEndIndexes[pixelIndex],
      );
    }

    const elements: RendererImageElement[] = Array(
      maxTransparentLayersEndIndex - minTransparentLayersStartIndex,
    );

    for (let elementIndex: number = 0; elementIndex < elements.length; elementIndex++) {
      let minDepth: number = NUMBER_MAX_INT32;
      let maxDepth: number = NUMBER_MIN_INT32;

      for (let pixelIndex: number = 0; pixelIndex < numberOfPixels; pixelIndex++) {
        const transparentLayerDepthArray: Int32Array =
          this.#transparentLayers[this.#transparentLayersStartIndexes[pixelIndex] + elementIndex]
            .depth;

        minDepth = Math.min(minDepth, transparentLayerDepthArray[pixelIndex]);
        maxDepth = Math.max(maxDepth, transparentLayerDepthArray[pixelIndex]);
      }

      const elementColorArray: Uint8ClampedArray = new Uint8ClampedArray(numberOfPixelsMul4);
      const elementDepthArray: Uint8Array | Uint16Array | Uint32Array =
        new (getUintNArrayConstructorFittingRange(maxDepth - minDepth))(numberOfPixels);

      for (let pixelIndex: number = 0; pixelIndex < numberOfPixels; pixelIndex++) {
        const transparentLayer: CPUImageRendererLayer =
          this.#transparentLayers[this.#transparentLayersStartIndexes[pixelIndex] + elementIndex];

        const pixelIndexColorIndex: number = pixelIndex * 4;
        const transparentLayerColorArray: Uint8ClampedArray = transparentLayer.color;

        for (
          let i: number = pixelIndexColorIndex, l: number = pixelIndexColorIndex + 4;
          i < l;
          i++
        ) {
          elementColorArray[i] = transparentLayerColorArray[i];
        }

        elementDepthArray[pixelIndex] = transparentLayer.depth[pixelIndex] - minDepth;
      }

      elements[elementIndex] = {
        x: this.#x,
        y: this.#y,
        z: minDepth,
        image: new ImageWithDepth(this.#width, this.#height, elementColorArray, elementDepthArray),
      };
    }

    return elements;
  }

  extractLayers(): RendererImageElement[] {
    return [this.#extractOpaqueLayer(), ...this.#extractTransparentLayers()];
  }

  /* OUTPUT */

  get output(): ImageData {
    return this.#output;
  }

  #clearOutput(): void {
    this.#output.data.fill(0);
  }

  renderOutput(): void {
    const outputData: Uint8ClampedArray = this.#output.data;

    outputData.set(this.#opaqueLayer.color);

    for (let viewportX: number = 0; viewportX < this.#width; viewportX++) {
      for (let viewportY: number = 0; viewportY < this.#height; viewportY++) {
        const viewportIndex: number = viewportX + viewportY * this.#width;
        const viewportColorIndex: number = viewportIndex * 4;

        const transparentLayersStartIndex: number =
          this.#transparentLayersStartIndexes[viewportIndex];
        const transparentLayersEndIndex: number = this.#transparentLayersEndIndexes[viewportIndex];

        for (
          let transparentLayerIndex: number = transparentLayersStartIndex;
          transparentLayerIndex < transparentLayersEndIndex;
          transparentLayerIndex++
        ) {
          const transparentLayerColorArray: Uint8ClampedArray =
            this.#transparentLayers[transparentLayerIndex].color;

          const alpha: number = 1 - transparentLayerColorArray[viewportColorIndex + 3] / 0xff;

          for (let i: number = 0; i < 4; i++) {
            outputData[viewportColorIndex + i] =
              outputData[viewportColorIndex + i] * alpha +
              transparentLayerColorArray[viewportColorIndex + i];
          }
        }
      }
    }
  }
}
