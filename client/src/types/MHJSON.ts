import * as G from 'geojson';

export enum MapType {
  NONE = '',
  CHOROPLETH = 'choropleth',
  CATEGORICAL = 'categorical',
  SYMBOL = 'symbol',
  DOT = 'dot',
  FLOW = 'flow',
}

export interface MHJSON {
  title: string;
  owner: string; //dont need cause we authorize the user.
  mapType: MapType;
  labels: Array<string>;
  globalChoroplethData: IChoroplethProps;
  globalCategoryData: Array<ICategoryProps>;
  globalSymbolData: Array<ISymbolProps>;
  globalDotDensityData: Array<IDotDensityProps>;
  regionsData: Array<IRegionProperties>;
  symbolsData: Array<ISymbolInstance>;
  dotsData: Array<IDotInstance>;
  arrowsData: Array<IArrowInstance>;
  geoJSON: G.GeoJSON;
}

export interface IChoroplethProps {
  minIntensity: number;
  maxIntensity: number;
  minColor: string;
  maxColor: string;
  indexingKey: string;
}

export interface ICategoryProps {
  color: string;
  name: string;
}

export interface ISymbolProps {
  svg: string;
  name: string;
}

export interface IDotDensityProps {
  name: string;
  opacity: number;
  size: number;
  color: string;
}

export interface IRegionProperties {
  color?: string;
  intensity?: number;
  category?: string;
}

export interface ISymbolInstance {
  x: number;
  y: number;
  scale: number;
  symbol: string;
}

export interface IDotInstance {
  x: number;
  y: number;
  scale: number;
  dot: string;
}

export interface IArrowInstance {
  label: string;
  color: string;
  opacity: number;
  capacity: number;
  interpolationPoints: Array<{
    x: number;
    y: number;
  }>;
}
