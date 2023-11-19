import * as G from 'geojson';
import { MHJSON, MapType } from 'types/MHJSON';

export function buildMHJSON(g: G.GeoJSON): MHJSON {
  return {
    title: '',
    owner: '',
    mapType: MapType.CATEGORICAL,
    labels: [],
    globalChoroplethData: {
      minIntensity: 0,
      maxIntensity: 0,
      minColor: '',
      maxColor: '',
      indexingKey: '',
    },
    globalCategoryData: [],
    globalSymbolData: [],
    globalDotDensityData: [],
    regionsData: [],
    symbolsData: [],
    dotsData: [],
    arrowsData: [],
    geoJSON: g,
  };
}
