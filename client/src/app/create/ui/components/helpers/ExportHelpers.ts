import { MHJSON } from 'types/MHJSON';
import { Layer, Map, GeoJSON } from 'leaflet';
import * as L from 'leaflet';
import { SVGBuilder } from './MHJSONVisitor';

export type ExportType = 'png' | 'svg' | 'json';

export default async function exportMap(map: MHJSON | null, type: ExportType) {
  let fileName = `${'map'}.${type}`;

  if (map === null) {
    console.log('map is null');
    return download(fileName, new Blob());
  }

  let b: Blob;
  switch (type) {
    case 'png':
      b = await pngOfMap(map);
      break;
    case 'svg':
      b = await svgOfMap(map);
      break;
    default:
      b = await jsonOfMap(map);
      break;
  }
  download(fileName, b);
}

function makeSVG(map: MHJSON): string {
  let builder = new SVGBuilder(map);
  let svg = builder.createSVG();
  let box = builder.getBBox();
  let svgRepr = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="${box.join(
    ' ',
  )}">
  <!-- Background -->
  <rect x="${box[0]}" y="${box[1]}" width="100%" height="100%" fill="#CCEFF1" />
  <!-- Contents -->
  ${svg}
</svg>`;
  return svgRepr;
}

function svgOfMap(map: MHJSON): Blob {
  let svgRepr = makeSVG(map);
  return new Blob([svgRepr]);
}
async function pngOfMap(map: MHJSON): Promise<Blob> {
  // var xml = makeSVG(map);
  // var svg64 = btoa(xml); //for utf8: btoa(unescape(encodeURIComponent(xml)))
  // var b64start = 'data:image/svg+xml;base64,';
  // var image64 = b64start + svg64;
  // const canvas = new OffscreenCanvas()
  // const ctx = canvas.getContext('2d');
  // const img = new Image();
  // img.src = 'data:image/svg+xml,' + encodeURIComponent(imageb4);
  // img.onload = function () {
  //   ctx.drawImage(img, 0, 0);
  //   // Convert canvas to data URL (PNG)
  //   const pngDataUrl = canvas.toDataURL('image/png');
  //   // Create a download link
  //   const link = document.createElement('a');
  //   link.href = pngDataUrl;
  //   link.download = 'output.png';
  //   link.click();
  // };
  // return new Blob([image64]);
  throw new Error('Unimplemented');
}
function jsonOfMap(map: MHJSON): Blob {
  throw new Error('Unimplemented');
}

function download(fileName: string, fileContents: Blob) {
  let url = URL.createObjectURL(fileContents);

  var element = document.createElement('a');
  element.setAttribute('href', url);
  element.setAttribute('download', fileName);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}
