import { timeStamp } from 'console';
import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const mapSchema = new Schema(
  {
    title: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    mapType: { type: String, required: true },
    published: { type: Boolean, required: true },
    labels: { type: [String], require: true },
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
      default: [],
    },
    globalSymbolData: {
      type: [
        {
          svg: String,
          name: String,
        },
      ],
      required: false,
      default: [],
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
      default: [],
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
      default: [],
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
      default: [],
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
      default: [],
    },
    geoJSON: {
      type: String,
      require: true,
    },
  },
  { timestamps: true },
);

const Map = mongoose.model('Map', mapSchema);
export default Map;
