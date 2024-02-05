export function getDataFileUri(dataType: string, dataStr: string, dataCharset: string | undefined = "utf-8"): string {
  return `data:${dataType};charset=${dataCharset},${encodeURIComponent(dataStr)}`;
}

export function makeTemporaryDownloadLink(url: string, fileName: string): void {
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
}

export function downloadData<D>(data: D, fileName: string, dataType?: string): void {
  const infoStr: string = JSON.stringify(data);
  const infoDataUri = getDataFileUri(dataType || "application/json", infoStr);
  makeTemporaryDownloadLink(infoDataUri, fileName);
}

export function isValidFile(acceptTypes: Array<string>, file: File | null): boolean {
  return file !== null && acceptTypes.includes(file.type);
}
