export class Texture2dWithZBuffer {
  static fromImageData(imageData: ImageData, depth?: Uint16Array): Texture2dWithZBuffer {
    return new Texture2dWithZBuffer(
      imageData.width,
      imageData.height,
      imageData.data,
      // new Uint8Array(imageData.data.buffer, imageData.data.byteOffset, imageData.data.byteLength),
      depth,
    );
  }

  readonly width: number;
  readonly height: number;

  readonly colorBuffer: Uint8ClampedArray;
  readonly zBuffer: Uint16Array;

  constructor(
    width: number,
    height: number,
    colorBuffer?: Uint8ClampedArray,
    zBuffer?: Uint16Array,
  ) {
    const depthLength: number = width * height;
    const colorLength: number = depthLength * 4;

    if (colorBuffer === undefined) {
      colorBuffer = new Uint8ClampedArray(colorLength);
    } else if (colorBuffer.length !== colorLength) {
      throw new Error(`colorBuffer should have a length of ${colorLength} (width * height * 4)`);
    }

    if (zBuffer === undefined) {
      zBuffer = new Uint16Array(depthLength);
    } else if (zBuffer.length !== depthLength) {
      throw new Error(`zBuffer should have a length of ${depthLength} (width * height)`);
    }

    this.width = width;
    this.height = height;
    this.colorBuffer = colorBuffer;
    this.zBuffer = zBuffer;
  }

  /**
   * Draws a `Texture2dWithHeightMap` on this `Texture2dWithHeightMap`
   * @param source the `Texture2dWithHeightMap` to draw
   * @param destination_x the _x_ position where to place `source`
   * @param destination_y the _y_ position where to place `source`
   * @param destination_z the _z_ position where to place `source`
   * @param source_x the _x_ position on the `source` where we start to draw
   * @param source_y the _y_ position on the `source` where we start to draw
   * @param source_width the _width_ we draw from `source`'s _x_
   * @param source_height the _height_ we draw from `source`'s _y_
   */
  put(
    source: Texture2dWithZBuffer,
    destination_x: number,
    destination_y: number,
    destination_z: number,
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
      let it_source_y: number = source_y, it_destination_y: number = destination_y;
      it_source_y < source_height;
      it_source_y++, it_destination_y++
    ) {
      for (
        let it_source_x: number = source_x,
          it_source_z_buffer_index: number = it_source_y * source.width,
          it_destination_z_buffer_index: number = destination_x + it_destination_y * this.width,
          it_source_color_buffer_index: number = it_source_z_buffer_index * 4,
          it_destination_color_buffer_index: number = it_destination_z_buffer_index * 4;
        it_source_x < source_width;
        it_source_x++,
          it_source_z_buffer_index++,
          it_destination_z_buffer_index++,
          it_source_color_buffer_index += 4,
          it_destination_color_buffer_index += 4
      ) {
        const it_source_z: number = Math.min(
          source.zBuffer[it_source_z_buffer_index] + destination_z,
          0xffff,
        );
        const it_destination_z: number = this.zBuffer[it_destination_z_buffer_index];

        this.zBuffer[it_source_z_buffer_index] = Math.max(it_source_z, it_destination_z);

        // https://en.wikipedia.org/wiki/Alpha_compositing

        if (it_source_z >= it_destination_z) {
          // => source is over destination
          const a: number = 1 - source.colorBuffer[it_source_color_buffer_index + 3] / 255;

          for (let i: number = 0; i < 4; i++) {
            this.colorBuffer[it_destination_color_buffer_index + i] =
              this.colorBuffer[it_destination_color_buffer_index + i] * a +
              source.colorBuffer[it_source_color_buffer_index + i];
          }
        } else {
          // => source is under destination
          const a: number = 1 - this.colorBuffer[it_destination_color_buffer_index + 3] / 255;

          for (let i: number = 0; i < 4; i++) {
            this.colorBuffer[it_destination_color_buffer_index + i] =
              this.colorBuffer[it_destination_color_buffer_index + i] +
              source.colorBuffer[it_source_color_buffer_index + i] * a;
          }
        }
      }
    }
  }

  clear(): void {
    this.colorBuffer.fill(0);
    this.zBuffer.fill(0);
  }

  clone(): Texture2dWithZBuffer {
    return new Texture2dWithZBuffer(
      this.width,
      this.height,
      this.colorBuffer.slice(),
      this.zBuffer.slice(),
    );
  }

  toImageData(): ImageData {
    return new ImageData(
      // new Uint8ClampedArray(this.color.buffer, this.color.byteOffset, this.color.byteLength),
      this.colorBuffer,
      this.width,
      this.height,
    );
  }
}
