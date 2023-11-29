import supertest from 'supertest';
import app from '../app';
import mapModel from '../models/map-model';
import userModel from '../models/user-model';
import mongoose from 'mongoose';
import auth from '../auth/index';
import fs from 'fs';
import util from 'util';
import path from 'path';
import {
  DeltaType,
  TargetType,
  Delta,
  DeltaPayload,
} from '../controllers/helperFunctions/mapHelper';

type MapDocument = typeof mapModel.prototype;

let mapData = {
  _id: new mongoose.Types.ObjectId(),
  title: 'mapNice',
  owner: new mongoose.Types.ObjectId(),
  mapType: 'categorical',
  published: false,
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
      description: 'From TESTING point',
    },
  },
  updatedAt: Math.floor(new Date().getTime() * Math.random()),
  createdAt: new Date().getTime(),
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

const userId = mapData.owner;

beforeEach(() => {
  jest.clearAllMocks();
  jest.setTimeout(6000);
  jest.spyOn(userModel, 'findById').mockResolvedValue({ id: userId });
});

describe('POST /map/map', () => {
  it('create a new map', async () => {
    const mockId = new mongoose.Types.ObjectId();
    jest
      .spyOn(mapModel.prototype, 'save')
      .mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });
    const mapDatas = {
      map: mapData,
    };

    jest.spyOn(fs.promises, 'mkdir').mockResolvedValue(undefined);
    jest.spyOn(fs.promises, 'writeFile').mockResolvedValue(undefined);

    const response = await supertest(app)
      .post('/map/create')
      .send(mapDatas)
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('map');
  });
  it('fails to create a map with invalid GeoJSON data', async () => {
    const mapDataWithInvalidGeoJSON = {
      title: 'Invalid GeoJSON Map',
      mapType: 'choropleth',
      geoJSON: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
          },
        ],
      },
    };

    const response = await supertest(app)
      .post('/map/create')
      .send({ map: mapDataWithInvalidGeoJSON })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBeDefined();
  });
  it('fails to create a map with missing fields', async () => {
    const incompleteData = {
      map: { title: 'no mappa' },
    };

    const response = await supertest(app)
      .post('/map/create')
      .send(incompleteData)
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    expect(response.statusCode).toBe(400);
  });
  it('handles file system errors gracefully', async () => {
    jest
      .spyOn(fs.promises, 'writeFile')
      .mockRejectedValue(new Error('File system error'));

    const response = await supertest(app)
      .post('/map/create')
      .send({ map: mapData })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    expect(response.statusCode).toBe(500);
  });
});

describe('GET /map/:mapID', () => {
  it('successfully retrieves a map by ID', async () => {
    // Mock data

    const mockMapId = new mongoose.Types.ObjectId();

    const mockMap = {
      ...mapData,
      _id: mockMapId,
      geoJson: 'mock/filePath',
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    // Mock only the readFile method
    jest
      .spyOn(fs.promises, 'readFile')
      .mockResolvedValue(JSON.stringify(mockMap.geoJSON));

    // Making the request
    const response = await supertest(app)
      .get(`/map/map/${mockMapId}`)
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('map');
    expect(response.body.map._id.toString()).toBe(mockMapId.toString());
    expect(response.body.map.geoJSON).toEqual(mockMap.geoJSON);
  });
});

describe('GET /map/recents/', () => {
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

      exec: jest.fn().mockResolvedValue(sortedAndLimitedData),
    };

    jest.spyOn(mapModel, 'find').mockImplementation(() => queryMock);
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
        published: false,
      },
      {
        _id: mockMaps[1]._id.toString(),
        title: mockMaps[1].title,
        png: { type: 'Buffer', data: [] },
        published: false,
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

describe('/map/payload/ dot payload', () => {
  beforeEach(() => {
    jest
      .spyOn(mapModel.prototype, 'save')
      .mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });
  });

  it('dot create', async () => {
    const mockMap = {
      ...createMockMap(
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
      geoJSON: 'somepath/path/now',
      dotsData: [
        {
          x: 10,
          y: 20,
          scale: 1,
          dot: 'IM DOT',
        },
      ],
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.DOT,
      target: [mockMap._id, -1, '-1'],
      payload: {
        x: 2,
        y: 2,
        scale: 1,
        dot: 'SOME DOT 2',
      },
    };

    jest
      .spyOn(mapModel.prototype, 'save')
      .mockImplementation(async function (this: MapDocument) {
        console.log('MOCKING THIS?', this.title);
        return this.toObject();
      });

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('map');
    expect(response.body.map.dotsData.length).toEqual(2);
  });
});

describe('/map/map update map by id', () => {
  beforeEach(() => {
    jest
      .spyOn(mapModel.prototype, 'save')
      .mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });
  });

  it('update title of map', async () => {
    const mapPayload = { mapId: mapData._id, title: 'UPDATED MAP NEW BIGN' };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mapData);

    const response = await supertest(app)
      .put('/map/map')
      .send(mapPayload)
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('map');
    expect(response.body.map.title).toEqual(mapPayload.title);
  });
  it('update title of map', async () => {
    const mapPayload = { title: 'UPDATED MAP NEW BIGN' };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mapData);

    const response = await supertest(app)
      .put('/map/map')
      .send(mapPayload)
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Map ID is required');
  });
});

afterEach(() => {
  // Reset mock after the test
  jest.clearAllMocks();
});