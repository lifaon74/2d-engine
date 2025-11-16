import { htmlImageElementToImageData } from './html-image-element-to-image-data';

export function imageUrlToImageData(url: URL | string): Promise<ImageData> {
  const img: HTMLImageElement = new Image();
  img.src = url.toString();
  return htmlImageElementToImageData(img);
}
