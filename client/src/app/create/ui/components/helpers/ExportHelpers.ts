import { MHJSON } from 'types/MHJSON';
import { Layer, Map, GeoJSON } from 'leaflet';
import * as L from 'leaflet';
import { SVGBuilder } from './MHJSONVisitor';
import { BBox } from 'context/editorHelpers/GeoJSONVisitor';

export type ExportType = 'png' | 'svg' | 'json';

export default async function exportMap(map: MHJSON | null, type: ExportType) {
  let fileName = `${'map'}.${type}`;

  if (map === null) {
    alert('TODO: what if map is null');
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

function makeSVG(map: MHJSON): [string, BBox] {
  let builder = new SVGBuilder(map);
  let svg = builder.createSVG();
  let box = builder.getBBox();
  let svgRepr = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="${box.join(
    ' ',
  )}">
  <rect x="${box[0]}" y="${box[1]}" width="100%" height="100%" fill="#CCEFF1" />
  ${svg}
</svg>`;
  return [svgRepr, box];
}

function svgOfMap(map: MHJSON): Blob {
  let svgRepr = makeSVG(map);
  return new Blob([svgRepr[0]]);
}
// given the map bounding box, return the width and height of the
// map (as a png)
const TARGET_SIZE = 2_073_600;
function getDimensions(b: BBox): [w: number, h: number] {
  let a0 = b[2] * b[3];
  let f = Math.sqrt(TARGET_SIZE / a0);
  return [b[2] * (1 + f), b[3] * f];
}

async function pngOfMap(map: MHJSON): Promise<Blob> {
  var [xml, box] = makeSVG(map);
  let svgBlob = new Blob([xml], { type: 'image/svg+xml' });
  let svgURL = URL.createObjectURL(svgBlob);

  const canvas = document.createElement('canvas');
  let [x, y] = getDimensions(box);
  const img = new Image(x, y);
  canvas.width = x;
  canvas.height = y;

  let prom: Promise<Blob> = new Promise((resolve, reject) => {
    img.onload = function () {
      let ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          b => {
            if (b === null) {
              // img.remove();
              reject('Created a null blob');
            } else {
              // img.remove();
              resolve(b);
            }
          },
          'image/png',
          1,
        );
      } else {
        // img.remove();
        reject('ctx is null');
      }
    };
  });

  img.src = svgURL;
  return prom;

  // throw new Error('Unimplemented');
}
function jsonOfMap(map: MHJSON): Blob {
  return new Blob([JSON.stringify(map)], { type: 'application/json' });
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
