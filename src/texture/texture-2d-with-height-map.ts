export class Texture2dWithHeightMap {
  static fromImageData(imageData: ImageData, depth?: Uint16Array): Texture2dWithHeightMap {
    return new Texture2dWithHeightMap(
      imageData.width,
      imageData.height,
      imageData.data,
      // new Uint8Array(imageData.data.buffer, imageData.data.byteOffset, imageData.data.byteLength),
      depth,
    );
  }

  readonly width: number;
  readonly height: number;

  readonly color: Uint8ClampedArray;
  readonly depth: Uint16Array;

  constructor(width: number, height: number, color?: Uint8ClampedArray, depth?: Uint16Array) {
    const depthLength: number = width * height;
    const colorLength: number = depthLength * 4;

    if (color === undefined) {
      color = new Uint8ClampedArray(colorLength);
    } else if (color.length !== colorLength) {
      throw new Error(`color should have a length of ${colorLength} (width * height * 4)`);
    }

    if (depth === undefined) {
      depth = new Uint16Array(depthLength);
    } else if (depth.length !== depthLength) {
      throw new Error(`depth should have a length of ${depthLength} (width * height)`);
    }

    this.width = width;
    this.height = height;
    this.color = color;
    this.depth = depth;
  }

  put(
    source: Texture2dWithHeightMap,
    destination_x: number,
    destination_y: number,
    destination_depth: number,
    source_x: number = 0,
    source_y: number = 0,
    source_width: number = source.width,
    source_height: number = source.height,
  ): void {
    destination_x = Math.max(0, Math.min(this.width, destination_x));
    destination_y = Math.max(0, Math.min(this.height, destination_y));

    source_x = Math.max(0, Math.min(source.width, this.width - destination_x, source_x));
    source_y = Math.max(0, Math.min(source.height, this.height - destination_y, source_y));

    source_width = Math.max(0, Math.min(this.width - destination_x - source_x, source_width));
    source_height = Math.max(0, Math.min(this.height - destination_y - source_y, source_height));

    for (
      let _source_y: number = source_y, _destination_y: number = destination_y;
      _source_y < source_height;
      _source_y++, _destination_y++
    ) {
      for (
        let _source_x: number = source_x,
          source_depth_index: number = _source_y * source.width,
          destination_depth_index: number = destination_x + _destination_y * this.width,
          source_color_index: number = source_depth_index * 4,
          destination_color_index: number = destination_depth_index * 4;
        _source_x < source_width;
        _source_x++,
          source_depth_index++,
          destination_depth_index++,
          source_color_index += 4,
          destination_color_index += 4
      ) {
        const source_depth: number = source.depth[source_depth_index] + destination_depth;

        if (source_depth >= this.depth[source_depth_index] && source_depth <= 0xffff) {
          this.depth[source_depth_index] = source_depth;

          // https://en.wikipedia.org/wiki/Alpha_compositing
          const alpha_source: number = source.color[source_color_index + 3] / 255;
          const alpha_source_inv: number = 1 - alpha_source;

          for (let i: number = 0; i < 3; i++) {
            this.color[destination_color_index + i] =
              source.color[source_color_index + i] +
              this.color[destination_color_index + i] * alpha_source_inv;
          }

          this.color[destination_color_index + 3] =
            source.color[source_color_index + 3] +
            this.color[destination_color_index + 3] * alpha_source_inv;

          // const a_0: number = source.color[color_index_source + 3];
          // const a_1: number = this.color[color_index_destination + 3] * (1 - a_0);
          // const a_2: number = a_0 + a_1;
          //
          // for (let i: number = 0; i < 3; i++) {
          //   this.color[color_index_destination + i] =
          //     (source.color[color_index_source + i] * a_0 +
          //       this.color[color_index_destination + i] * a_1) /
          //     a_2;
          // }
        }
      }
    }
  }

  clear(): void {
    this.color.fill(0);
    this.depth.fill(0);
  }

  toImageData(): ImageData {
    return new ImageData(
      // new Uint8ClampedArray(this.color.buffer, this.color.byteOffset, this.color.byteLength),
      this.color,
      this.width,
      this.height,
    );
  }
}
