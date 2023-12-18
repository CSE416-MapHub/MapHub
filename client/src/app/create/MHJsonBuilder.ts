import { DELETED_NAME } from 'context/editorHelpers/DeltaUtil';
import * as G from 'geojson';
import { MHJSON, MapType } from 'types/MHJSON';

export function buildMHJSON(g: G.GeoJSON | string): MHJSON {
  const geoJSON = typeof g === 'string' ? JSON.parse(g) : g;

  return {
    title: '',
    owner: '',
    mapType: MapType.CATEGORICAL,
    labels: [],
    globalChoroplethData: {
      minIntensity: 0,
      maxIntensity: 100,
      minColor: '#000000',
      maxColor: '#FFFFFF',
      indexingKey: DELETED_NAME,
    },
    globalCategoryData: [],
    globalSymbolData: [],
    globalDotDensityData: [],
    regionsData: [],
    symbolsData: [],
    dotsData: [],
    arrowsData: [],
    geoJSON: geoJSON,
  };
}
