import { DataTable } from 'dbf-reader/models/dbf-file';
import * as shp from 'shapefile';
import tj from '@mapbox/togeojson';
import { Dbf } from 'dbf-reader/dbf';
import * as G from 'geojson';

function mergeData(
  gjson: GeoJSON.GeoJSON | null,
  dbf: DataTable | null,
): GeoJSON.GeoJSON | null {
  console.log('MERGING DATA');
  console.log(gjson);
  console.log(dbf);
  if (!dbf && gjson) {
    return gjson;
  }
  if (!gjson) {
    return null;
  }
  // go through looking for features
  let featureNo = 0;
  function visit(gjson: GeoJSON.GeoJSON) {
    switch (gjson.type) {
      case 'Feature': {
        gjson.properties = dbf?.rows[featureNo];
        featureNo++;
        break;
      }
      case 'FeatureCollection': {
        for (let f of gjson.features) {
          visit(f);
        }
        break;
      }

      default:
        break;
    }
  }
  visit(gjson);
  return gjson;
}

export const handleFiles = (fileList: FileList): Promise<G.GeoJSON> => {
  // New File List
  const files: File[] = [];
  if (fileList) {
    // Iterate and insert into a new file list.
    for (let i = 0; i < fileList.length; i += 1) {
      files.push(fileList[i]);
    }

    // Sort by file extension.
    files.sort((a, b) => {
      const aFileExt: string | undefined = a.name.split('.').pop();
      const bFileExt: string | undefined = b.name.split('.').pop();
      if (aFileExt && bFileExt) {
        // Sort both file extensions alphabetically.
        if (aFileExt < bFileExt) {
          return -1;
        } else if (aFileExt > bFileExt) {
          return 1;
        }
      } else if (aFileExt && !bFileExt) {
        // Move file without no extension to the back.
        return -1;
      } else if (!aFileExt && bFileExt) {
        // Move file without no extension to the back.
        return 1;
      } else {
        // Sort file names alphabetically.
        if (a.name < b.name) {
          return -1;
        } else if (a.name > b.name) {
          return 1;
        }
      }
      return 0;
    });
  }

  // Handle loading files.
  // TODO: Handle more file extensions listed in the accept string.
  // TODO: Verify files more rigorously (not through file extension).
  // TODO: Verify file combinations.
  if (
    (files.length === 1 && files[0].name.split('.').pop() === 'json') ||
    files[0].name.split('.').pop() === 'geojson'
  ) {
    // Handle shape file conversion to GeoJSON.
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = e => {
        const content = e.target?.result as string;
        const geojsonData = JSON.parse(content);
        resolve(geojsonData);
      };
      reader.readAsText(files[0]);
    });
  } else if (files.length === 1 && files[0].name.split('.').pop() === 'kml') {
    // Handle KML conversion to GeoJSON.
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = e => {
        if (e.target?.result) {
          const parser = new DOMParser();
          const kml = parser.parseFromString(
            e.target.result as string,
            'text/xml',
          );
          const converted = tj.kml(kml);
          resolve(converted);
        }
      };
    });

    reader.readAsText(files[0]);
  } else if (
    (files.length === 2 &&
      files[0].name.split('.').pop() === 'dbf' &&
      files[1].name.split('.').pop() === 'shp') ||
    (files.length === 3 &&
      files[0].name.split('.').pop() === 'dbf' &&
      files[1].name.split('.').pop() === 'shp' &&
      files[2].name.split('.').pop() === 'shx')
  ) {
    // Handle shape file conversion to GeoJSON.

    return new Promise((resolve, reject) => {
      let gjson: GeoJSON.GeoJSON | null = null;
      let dtable: DataTable | null = null;
      const shpReader = new FileReader();

      shpReader.onload = async e => {
        if (e.target?.result) {
          const arrayBuffer = e.target.result as ArrayBuffer;
          gjson = await shp.read(arrayBuffer);
          let result = mergeData(gjson, dtable);
          if (result) {
            resolve(result);
          }
        }
      };
      shpReader.readAsArrayBuffer(files[1]);

      // Handle DBF conversion to GeoJSON
      const dbfReader = new FileReader();
      dbfReader.onload = () => {
        var arrayBuffer: ArrayBuffer = dbfReader.result as ArrayBuffer;
        if (arrayBuffer) {
          console.log(arrayBuffer);
          let buffer: Buffer = Buffer.from(arrayBuffer);
          dtable = Dbf.read(buffer);
          let result = mergeData(gjson, dtable);
          if (result) {
            resolve(result);
          }
        }
      };
      dbfReader.readAsArrayBuffer(files[0]);
    });
  } else if (
    files.reduce((acc, curr) => acc || /.(dbf|shp)$/.test(curr.name), false)
  ) {
    return new Promise((resolve, reject) => {
      reject('To load a shape file map, upload 1 .shp, and 1 .dbf file.');
    });
  } else {
    return new Promise((resolve, reject) => {
      reject(
        'To load a map, upload 1 combination of .shp and .dbf file, 1 .json file, or 1 .kml file.',
      );
    });
  }
};
