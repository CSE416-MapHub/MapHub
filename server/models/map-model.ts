import mongoose from 'mongoose';

const Schema = mongoose.Schema;

type MapType = 'choropleth' | 'categorical' | 'symbol' | 'dot' | 'flow';

interface IChoroplethProps {
  minIntensity: number;
  maxIntensity: number;
  minColor: string;
  maxColor: string;
  indexingKey: string;
}

interface ICategoryProps {
  color: string;
  name: string;
}

interface ISymbolProps {
  svg: string;
  name: string;
}

interface IDotDensityProps {
  name: string;
  opacity: number;
  size: number;
  color: string;
}

interface IRegionProperties {
  color: string;
  intensity: number;
  category: string;
}

interface ISymbolInstance {
  x: number;
  y: number;
  scale: number;
  symbol: string;
}

interface IDotInstance {
  x: number;
  y: number;
  scale: number;
  dot: string;
}

interface IArrowInstance {
  label: string;
  color: string;
  opacity: number;
  capacity: number;
  interpolationPoints: {
    x: number;
    y: number;
  }[];
}

interface Map {
  mapType: MapType;
  globalChoroplethData: IChoroplethProps | null;
  globalCategoryData: ICategoryProps[] | null;
  globalSymbolData: ISymbolProps[] | null;
  globalDotDensityData: IDotDensityProps[] | null;

  regionsData: IRegionProperties[];
  symbolsData: ISymbolInstance[] | null;
  dotsData: IDotInstance[] | null;
  arrowsData: IArrowInstance[] | null;

  geoJSON: string;
}

const mapSchema = new Schema<Map>({
  mapType: { type: String, required: true },
  globalChoroplethData: {
    type: {
      minIntensity: Number,
      maxIntensity: Number,
      minColor: String,
      maxColor: String,
      indexingKey: String,
    },
    required: false,
    default: null,
  },
  globalCategoryData: {
    type: [
      {
        color: String,
        name: String,
      },
    ],
    required: false,
    default: null,
  },
  globalSymbolData: {
    type: [
      {
        svg: String,
        name: String,
      },
    ],
    required: false,
    default: null,
  },

  globalDotDensityData: {
    type: [
      {
        name: String,
        opacity: Number,
        size: Number,
        color: String,
      },
    ],
    required: false,
    default: null,
  },
  regionsData: [
    {
      color: { type: String, required: true, default: '#FFFFFF' },
      intensity: { type: Number, required: false },
      category: { type: String, required: false },
    },
  ],

  symbolsData: {
    type: [
      {
        x: Number,
        y: Number,
        scale: Number,
        symbol: String,
      },
    ],
    required: false,
    default: null,
  },
  dotsData: {
    type: [
      {
        x: Number,
        y: Number,
        scale: Number,
        dot: String,
      },
    ],
    required: false,
    default: null,
  },
  arrowsData: {
    type: [
      {
        label: String,
        color: String,
        opacity: Number,
        capacity: Number,
        interpolationPoints: [
          {
            x: Number,
            y: Number,
          },
        ],
      },
    ],
    required: false,
    default: null,
  },
  geoJSON: String,
});

const Map = mongoose.model('Map', mapSchema);
export default Map;
