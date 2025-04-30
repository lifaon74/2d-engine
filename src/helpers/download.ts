export function download(url: string, fileName: string): void {
  const a: HTMLAnchorElement = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
}
