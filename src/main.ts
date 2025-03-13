

// [...N*[r, g, b, a, h]]

export class Texture2DWithHeightMap {
  static async fromUrls(textureUrl: string, depthUrl: string): Promise<Texture2DWithHeightMap> {
    const [texture, depth] = await Promise.all([
      fetch(textureUrl).then(response => response.blob()),
      fetch(depthUrl).then(response => response.blob()),
    ]);
  }


  // static fromBlob(): Promise<Texture2DWithHeightMap> {
  //   createImageBitmap()
  // }

  // static fromBlob(): Promise<Texture2DWithHeightMap> {
  //   createImageBitmap()
  // }

  static fromImageBitmap(imageBitmap: ImageBitmap): Promise<Texture2DWithHeightMap> {
    createImageBitmap()
  }

  static fromImageData(imageData: ImageData, depth: Uint16Array): Texture2DWithHeightMap {
   return new Texture2DWithHeightMap(
     imageData.width,
     imageData.height,
     new Uint8Array(imageData.data.buffer, imageData.data.byteLength, imageData.data.byteLength),
     depth,
   );
  }

  readonly width: number;
  readonly height: number;

  readonly color: Uint8Array;
  readonly depth: Uint16Array;

  constructor(
    width: number,
    height: number,
    color: Uint8Array,
    depth: Uint16Array,
  ) {
  }

}

function main(): void {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  // ctx.drawImage
  // ctx.putImageData();
}

main();
