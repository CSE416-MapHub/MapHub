import supertest from 'supertest';
import app from '../app';
import mapModel from '../models/map-model';
import mongoose from 'mongoose';
import auth from '../auth/index';

let mapData = {
  title: 'mapNice',
  owner: new mongoose.Types.ObjectId(),
  mapType: 'categorical',
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
  geoJSON: {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-73.935242, 40.73061],
    },
    properties: {
      name: 'Point',
      description: 'description point',
    },
  },
  updatedAt: Math.floor(new Date().getTime() * Math.random()),
};
function createMockMap(
  title: string,
  geoJSONType: string,
  geoJSONCoordinates: number[] | number[][] | number[][][],
  timeOrder: number,
) {
  return {
    ...mapData,
    _id: new mongoose.Types.ObjectId(),
    title: title,
    geoJSON: {
      ...mapData.geoJSON,
      geometry: {
        type: geoJSONType,
        coordinates: geoJSONCoordinates,
      },
    },
    updatedAt: Math.floor(new Date().getTime() * timeOrder),
  };
}
//Map Three, Map two, map 1
const mockMaps = [
  createMockMap('Map One', 'Point', [-73.935242, 40.73061], 0.5),
  createMockMap(
    'Map Two',
    'LineString',
    [
      [-73.935242, 40.73061],
      [-74.935242, 41.73061],
    ],
    0.6,
  ),
  createMockMap(
    'Map Three',
    'Polygon',
    [
      [
        [-73.935242, 40.73061],
        [-74.935242, 41.73061],
        [-74.935242, 39.73061],
        [-73.935242, 40.73061],
      ],
    ],
    0.7,
  ),
];

const userId = mapData.owner;

beforeEach(() => {
  jest.setTimeout(6000);
});

jest.mock('../models/map-model');

describe('POST /map/map', () => {
  it('create a new map', async () => {
    const mockId = new mongoose.Types.ObjectId();
    const savedMap = {
      _id: mockId,
    };
    mapModel.prototype.save = jest.fn().mockResolvedValue(savedMap);

    const response = await supertest(app)
      .post('/map/map')
      .send(mapData)
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty('map');
  });
});

describe('GET /map/recents/', () => {
  beforeEach(() => {
    // Setup specific mock for this test
    let sortedAndLimitedData = [...mockMaps];

    const queryMock: any = {
      sort: jest.fn().mockImplementation(sortParam => {
        sortedAndLimitedData = sortedAndLimitedData.sort((a, b) => {
          return sortParam.updatedAt === 1
            ? a.updatedAt - b.updatedAt
            : b.updatedAt - a.updatedAt;
        });

        return queryMock;
      }),
      // limit: jest.fn().mockImplementation(limitNumber => {
      //   sortedAndLimitedData = sortedAndLimitedData.slice(0, limitNumber);
      //   console.log('LIMIT AMOUNT', sortedAndLimitedData.length);
      //   return queryMock;
      // }),
      exec: jest.fn().mockResolvedValue(sortedAndLimitedData),
    };

    jest.spyOn(mapModel, 'find').mockImplementation(() => queryMock);
  });

  afterEach(() => {
    // Reset mock after the test
    jest.restoreAllMocks();
  });

  it('gets a specified number of recent maps', async () => {
    const numOfMaps = 2;

    // Making the GET request with query parameter
    const response = await supertest(app)
      .get(`/map/recents/?numOfMaps=${numOfMaps}`)
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    const expectedMapOutput = [
      {
        _id: mockMaps[2]._id.toString(),
        title: mockMaps[2].title,
        png: { type: 'Buffer', data: [] },
      },
      {
        _id: mockMaps[1]._id.toString(),
        title: mockMaps[1].title,
        png: { type: 'Buffer', data: [] },
      },
    ];
    // console.log('EXPECTEED', JSON.stringify(expectedMapOutput));
    // Assertions for success case
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('maps');
    expect(response.body.maps.length).toBe(numOfMaps);
    expect(response.body.maps).toEqual(expectedMapOutput);
  });

  it('returns error for negative numOfMaps', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const numOfMaps = -1;

    // Making the GET request with negative numOfMaps
    const response = await supertest(app)
      .get(`/map/recents/?numOfMaps=${numOfMaps}`)
      .set('Cookie', [`token=${auth.signToken(userId)}`]);

    // Assertions for error case
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('errorMessage');
    expect(response.body.errorMessage).toBe(
      'Number of maps must be a positive number',
    );
  });
});
