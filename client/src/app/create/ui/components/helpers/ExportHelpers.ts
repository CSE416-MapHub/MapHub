import { MHJSON } from 'types/MHJSON';

export type ExportType = 'png' | 'svg' | 'json';

export default function exportMap(map: MHJSON | null, type: ExportType) {
  if (map === null) {
    return new Blob();
  }
  let fileName = `${encodeURIComponent(map.title)}.${type}`;

  let b: Blob;
  switch (type) {
    case 'png':
      b = pngOfMap(map);
      break;
    case 'svg':
      b = svgOfMap(map);
      break;
    default:
      b = jsonOfMap(map);
      break;
  }
  download(fileName, b);
}

function svgOfMap(map: MHJSON): Blob {
  throw new Error('Unimplemented');
}
function pngOfMap(map: MHJSON): Blob {
  throw new Error('Unimplemented');
}
function jsonOfMap(map: MHJSON): Blob {
  throw new Error('Unimplemented');
}
function download(fileName: string, fileContents: Blob) {}
