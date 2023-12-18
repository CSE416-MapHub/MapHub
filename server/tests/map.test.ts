import supertest from 'supertest';
import app from '../app';
import mapModel from '../models/map-model';
import userModel from '../models/user-model';
import mongoose from 'mongoose';
import auth from '../auth/index';
import fs from 'fs';
import util from 'util';
import path from 'path';
import { DELETED_NAME } from '../controllers/helperFunctions/MapVistors';
import {
  DeltaType,
  TargetType,
  Delta,
  DeltaPayload,
  MapPayload,
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
export function createMockMap(
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
  jest.spyOn(userModel, 'findById').mockResolvedValue({
    id: userId,
    maps: [],
    save: jest.fn().mockReturnThis(),
  });
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

  const geoJSONTemp = {
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [-73.935242, 40.73061] },
    properties: { name: 'Point', description: 'description point' },
  };

  beforeEach(() => {
    // Setup specific mock for this test
    jest
      .spyOn(fs.promises, 'readFile')
      .mockResolvedValue(JSON.stringify(geoJSONTemp));

    let sortedAndLimitedData = [
      { ...mockMaps[0], geoJSON: 'path/somewhere' },
      { ...mockMaps[1], geoJSON: 'path/somewhere' },
      { ...mockMaps[2], geoJSON: 'path/somewhere' },
    ];

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
        svg: 'iVBORw0KGgoAAAANSUhEUgAAAQUAAAJRCAYAAABMYaLtAAAGM0lEQVR4nO3UQRUAEABAMfpX08WTgIvL77CF2Fz73AHwSQEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpAPC+WgeW92cvNAAAAAElFTkSuQmCC',
        owner: mockMaps[2].owner.toString(),
        published: mockMaps[2].published,
      },
      {
        _id: mockMaps[1]._id.toString(),
        title: mockMaps[1].title,
        svg: 'iVBORw0KGgoAAAANSUhEUgAAAQUAAAJRCAYAAABMYaLtAAAGM0lEQVR4nO3UQRUAEABAMfpX08WTgIvL77CF2Fz73AHwSQEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpASAEIKQAhBSCkAIQUgJACEFIAQgpAPC+WgeW92cvNAAAAAElFTkSuQmCC',
        owner: mockMaps[1].owner.toString(),
        published: mockMaps[1].published,
      },
    ];

    // console.log('EXPECTEED', JSON.stringify(expectedMapOutput));
    // Assertions for success case
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('maps');
    expect(response.body.maps.length).toBe(numOfMaps);
    // expect(response.body.maps).toEqual(expectedMapOutput);
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
      globalDotDensityData: [
        {
          name: 'SOME DOT 2',
          opacity: 1,
          size: 2,
          color: '#FFFFFF',
        },
      ],
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.DOT,
      target: [mockMap._id, mockMap.dotsData.length, '-1'],
      payload: {
        x: 2,
        y: 2,
        scale: 1,
        dot: 'SOME DOT 2',
      },
    };

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

  it('dot create fail because no global dot', async () => {
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
      target: [mockMap._id, mockMap.dotsData.length, '-1'],
      payload: {
        x: 2,
        y: 2,
        scale: 1,
        dot: 'SOME DOT 2',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe(
      'GLOBAL Dot doesnt exist for this dot name SOME DOT 2',
    );
  });

  it('dot undo delete dot', async () => {
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
          dot: 'IM DOT' + DELETED_NAME,
        },
        {
          x: 10,
          y: 20,
          scale: 1,
          dot: 'IM DOT',
        },
      ],
      globalDotDensityData: [
        {
          name: 'IM DOT',
          opacity: 1,
          size: 2,
          color: '#FFFFFF',
        },
      ],
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.DOT,
      target: [mockMap._id, 0, '-1'],
      payload: {
        x: 2,
        y: 2,
        scale: 1,
        dot: 'IM DOT',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('map');
    expect(response.body.map.dotsData[0].dot).toEqual('IM DOT');
    expect(response.body.map.dotsData[0].x).toEqual(2);
    expect(response.body.map.dotsData[0].y).toEqual(2);
  });

  it('dot update', async () => {
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
        {
          x: 2,
          y: 2,
          scale: 1,
          dot: 'SOME DOT 2',
        },
      ],
    };

    const delta = {
      type: DeltaType.UPDATE,
      targetType: TargetType.DOT,
      target: [mockMap._id, 1, '-1'],
      payload: {
        x: 313131,
        y: 212121,
        scale: 100,
        dot: 'UPDATED DOT',
      },
    };

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
    expect(response.body.map.dotsData[1]).toEqual({
      x: 313131,
      y: 212121,
      scale: 100,
      dot: 'UPDATED DOT',
      _id: response.body.map.dotsData[1]._id,
    });
  });

  it('dot deleting', async () => {
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
        {
          x: 2,
          y: 2,
          scale: 1,
          dot: 'SOME DOT 2',
        },
      ],
    };

    const delta = {
      type: DeltaType.DELETE,
      targetType: TargetType.DOT,
      target: [mockMap._id, 1, '-1'],
      payload: {},
    };

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
    expect(response.body.map.dotsData[1]).toEqual({
      x: 2,
      y: 2,
      scale: 1,
      dot: 'SOME DOT 2' + DELETED_NAME,
      _id: response.body.map.dotsData[1]._id,
    });
  });

  it('empty delta', async () => {
    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: {} })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);
    expect(response.statusCode).toBe(400);
  });

  it('no create payload delta', async () => {
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
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.DOT,
      target: [mockMap._id, mockMap.dotsData.length, '-1'],
      payload: {
        x: 313131,
        y: 212121,
        scale: 100,
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Dot name is required');
  });
});

describe('/map/payload/ global dot payload', () => {
  beforeEach(() => {
    jest
      .spyOn(mapModel.prototype, 'save')
      .mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });
  });

  it('global dot create', async () => {
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
      globalDotDensityData: [],
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.GLOBAL_DOT,
      target: [mockMap._id, mockMap.globalDotDensityData.length, '-1'],
      payload: {
        name: 'dot group global',
        opacity: 1,
        size: 10,
        color: '#FFFFFF',
      },
    };

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
    expect(response.body.map.globalDotDensityData.length).toEqual(1);
    expect(response.body.map.globalDotDensityData).toEqual([
      {
        name: 'dot group global',
        opacity: 1,
        size: 10,
        color: '#FFFFFF',
        _id: response.body.map.globalDotDensityData[0]._id,
      },
    ]);
  });

  it('global dot undo delete', async () => {
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
      globalDotDensityData: [
        {
          name: 'dot group global' + DELETED_NAME,
          opacity: 1,
          size: 10,
          color: '#FFFFFF',
        },
      ],
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.GLOBAL_DOT,
      target: [mockMap._id, 0, '-1'],
      payload: {
        name: 'dot group global',
        opacity: 1,
        size: 10,
        color: '#FFFFFF',
      },
    };

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
    expect(response.body.map.globalDotDensityData.length).toEqual(1);
    expect(response.body.map.globalDotDensityData).toEqual([
      {
        name: 'dot group global',
        opacity: 1,
        size: 10,
        color: '#FFFFFF',
        _id: response.body.map.globalDotDensityData[0]._id,
      },
    ]);
  });

  it('global dot update', async () => {
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
          dot: 'DOT GROUP 1',
        },
        {
          x: 2,
          y: 2,
          scale: 1,
          dot: 'DOT GROUP 1',
        },
      ],
      globalDotDensityData: [
        {
          name: 'DOT GROUP 1',
          opacity: 2,
          size: 10,
          color: '#FFFFFF',
        },
        {
          name: 'DOT GROUP 2',
          opacity: 2,
          size: 10,
          color: '#FFFFFF',
        },
      ],
    };

    const delta = {
      type: DeltaType.UPDATE,
      targetType: TargetType.GLOBAL_DOT,
      target: [mockMap._id, 0, '-1'],
      payload: {
        name: 'Updated Dot Group Global',
        opacity: 0.2,
        size: 100,
        color: '#FF4D7A',
      },
    };

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
    expect(response.body.map.globalDotDensityData[0]).toEqual({
      name: 'Updated Dot Group Global',
      opacity: 0.2,
      size: 100,
      color: '#FF4D7A',
      _id: response.body.map.globalDotDensityData[0]._id,
    });
    expect(response.body.map.dotsData).toEqual([
      {
        x: 10,
        y: 20,
        scale: 1,
        dot: 'DOT GROUP 1',
        _id: response.body.map.dotsData[0]._id,
      },
      {
        x: 2,
        y: 2,
        scale: 1,
        dot: 'DOT GROUP 1',
        _id: response.body.map.dotsData[1]._id,
      },
    ]);
  });
  it('global dot delete', async () => {
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
      globalDotDensityData: [
        {
          name: 'dot group global',
          opacity: 1,
          size: 10,
          color: '#FFFFFF',
        },
      ],
    };

    const delta = {
      type: DeltaType.DELETE,
      targetType: TargetType.GLOBAL_DOT,
      target: [mockMap._id, 0, '-1'],
      payload: {},
    };

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
    expect(response.body.map.globalDotDensityData.length).toEqual(1);
    expect(response.body.map.globalDotDensityData).toEqual([
      {
        name: 'dot group global' + DELETED_NAME,
        opacity: 1,
        size: 10,
        color: '#FFFFFF',
        _id: response.body.map.globalDotDensityData[0]._id,
      },
    ]);
  });

  it('no create payload delta', async () => {
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
      globalDotDensityData: [
        {
          name: 'hi',
          opacity: 'dak',
        },
      ],
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.GLOBAL_DOT,
      target: [mockMap._id, mockMap.globalDotDensityData.length, '-1'],
      payload: {
        name: 'd',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('GlobalDot Opacity is required');
  });
});

describe('/map/payload/ global Category ', () => {
  beforeEach(() => {
    jest
      .spyOn(mapModel.prototype, 'save')
      .mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });
  });

  it('global category create', async () => {
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
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.GLOBAL_CATEGORY,
      target: [mockMap._id, mockMap.globalCategoryData.length, '-1'],
      payload: {
        name: 'new Category about russia',
        color: '#FFFFFF',
      },
    };

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
    expect(response.body.map.globalCategoryData.length).toEqual(1);
    expect(response.body.map.globalCategoryData[0].name).toEqual(
      'new Category about russia',
    );
    expect(response.body.map.globalCategoryData[0].color).toEqual('#FFFFFF');
  });

  it('global category delete then undo delete', async () => {
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
      globalCategoryData: [
        {
          name: 'existing category 1',
          color: '#FFFFFF',
        },
      ],
      regionsData: [
        {
          color: '#FFFFFF',
          intensity: 2,
          category: 'existing category 1',
        },
      ],
    };
    const deltaDelete = {
      type: DeltaType.DELETE,
      targetType: TargetType.GLOBAL_CATEGORY,
      target: [mockMap._id, 0, '-1'],
      payload: {
        name: 'existing category 1',
        color: '#FFFFFF',
      },
    };

    const deltaCreate = {
      type: DeltaType.CREATE,
      targetType: TargetType.GLOBAL_CATEGORY,
      target: [mockMap._id, 0, '-1'],
      payload: {
        name: 'existing category 1',
        color: '#FFFFFF',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    let response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: deltaDelete })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('map');
    expect(response.body.map.globalCategoryData[0].name).toEqual(
      'existing category 1' + DELETED_NAME,
    );
    expect(response.body.map.regionsData[0].category).toEqual(
      'existing category 1' + DELETED_NAME,
    );

    response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: deltaCreate })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('map');
    expect(response.body.map.globalCategoryData[0].name).toEqual(
      'existing category 1',
    );
    expect(response.body.map.regionsData[0].category).toEqual(
      'existing category 1',
    );
  });

  it('global category update', async () => {
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
      globalCategoryData: [
        {
          name: 'existing category 1',
          color: '#FFFFFF',
        },
      ],
      regionsData: [
        {
          color: '#FFFFFF',
          intensity: 2,
          category: 'existing category 1',
        },
      ],
    };

    const delta = {
      type: DeltaType.UPDATE,
      targetType: TargetType.GLOBAL_CATEGORY,
      target: [mockMap._id, 0, '-1'],
      payload: {
        name: 'Updated Category',
      },
    };

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
    expect(response.body.map.globalCategoryData[0].name).toEqual(
      'Updated Category',
    );
    expect(response.body.map.regionsData[0].category).toEqual(
      'Updated Category',
    );
  });

  it('empty delta', async () => {
    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: {} })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);
    expect(response.statusCode).toBe(400);
  });

  it('no create payload delta', async () => {
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
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.DOT,
      target: [mockMap._id, mockMap.dotsData.length, '-1'],
      payload: {
        x: 313131,
        y: 212121,
        scale: 100,
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Dot name is required');
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
    const mapPayload = {
      mapPayload: {
        mapId: mapData._id.toString(),
        title: 'UPDATED MAP NEW BIGN',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mapData);

    const response = await supertest(app)
      .put('/map/map')
      .send(mapPayload)
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('map');
    expect(response.body.map.title).toEqual(mapPayload.mapPayload.title);
  });

  it('update title of map without id', async () => {
    const mapPayload = { mapPayload: { title: 'UPDATED MAP NEW BIGN' } };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mapData);

    const response = await supertest(app)
      .put('/map/map')
      .send(mapPayload)
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Map ID is required');
  });
});

describe('/map/payload/ global symbol payload', () => {
  beforeEach(() => {
    jest
      .spyOn(mapModel.prototype, 'save')
      .mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });
  });

  it('global symbol create', async () => {
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
      globalSymbolData: [],
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.GLOBAL_SYMBOL,
      target: [mockMap._id, mockMap.globalSymbolData.length, '-1'],
      payload: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-73.935242 -40.73061 0 0"> <rect x="-73.935242" y="-40.73061" width="100%" height="100%" fill="#CCEFF1" /> </svg>',
        name: 'polygonA',
      },
    };

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
    expect(response.body.map.globalSymbolData.length).toEqual(1);
    expect(response.body.map.globalSymbolData).toEqual([
      {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-73.935242 -40.73061 0 0"> <rect x="-73.935242" y="-40.73061" width="100%" height="100%" fill="#CCEFF1" /> </svg>',
        name: 'polygonA',
        _id: response.body.map.globalSymbolData[0]._id,
      },
    ]);
  });
  it('global symbol update', async () => {
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
      symbolsData: [
        {
          x: 10,
          y: 20,
          scale: 1,
          symbol: 'polygonA',
        },
        {
          x: 2,
          y: 2,
          scale: 1,
          symbol: 'polygonA',
        },
      ],
      globalSymbolData: [
        {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-73.935242 -40.73061 0 0"> <rect x="-73.935242" y="-40.73061" width="100%" height="100%" fill="#CCEFF1" /> </svg>',
          name: 'polygonA',
        },
      ],
    };

    const delta = {
      type: DeltaType.UPDATE,
      targetType: TargetType.GLOBAL_SYMBOL,
      target: [mockMap._id, 0, '-1'],
      payload: {
        name: 'Updated PolygonName',
        svg: 'ddd',
      },
    };

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
    expect(response.body.map.globalSymbolData[0]).toEqual({
      name: 'Updated PolygonName',
      svg: 'ddd',
      _id: response.body.map.globalSymbolData[0]._id,
    });
    expect(response.body.map.symbolsData).toEqual([
      {
        x: 10,
        y: 20,
        scale: 1,
        symbol: 'Updated PolygonName',
        _id: response.body.map.symbolsData[0]._id,
      },
      {
        x: 2,
        y: 2,
        scale: 1,
        symbol: 'Updated PolygonName',
        _id: response.body.map.symbolsData[1]._id,
      },
    ]);
  });

  it('global symbol delete then undo delete', async () => {
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
      symbolsData: [
        {
          x: 10,
          y: 20,
          scale: 1,
          symbol: 'polygonA',
        },
        {
          x: 2,
          y: 2,
          scale: 1,
          symbol: 'polygonA',
        },
      ],
      globalSymbolData: [
        {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-73.935242 -40.73061 0 0"> <rect x="-73.935242" y="-40.73061" width="100%" height="100%" fill="#CCEFF1" /> </svg>',
          name: 'polygonA',
        },
        {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-73.935242 -40.73061 0 0"> <rect x="-73.935242" y="-40.73061" width="100%" height="100%" fill="#CCEFF1" /> </svg>',
          name: 'randomsh',
        },
      ],
    };

    const deleteDelta = {
      type: DeltaType.DELETE,
      targetType: TargetType.GLOBAL_SYMBOL,
      target: [mockMap._id, 0, '-1'],
      payload: {},
    };
    const createDelta = {
      type: DeltaType.CREATE,
      targetType: TargetType.GLOBAL_SYMBOL,
      target: [mockMap._id, 0, '-1'],
      payload: {
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-73.935242 -40.73061 0 0"> <rect x="-73.935242" y="-40.73061" width="100%" height="100%" fill="#CCEFF1" /> </svg>',
        name: 'polygonA',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    let response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: deleteDelta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('map');
    expect(response.body.map.globalSymbolData[0].name).toEqual(
      'polygonA' + DELETED_NAME,
    );
    expect(response.body.map.symbolsData).toEqual([
      {
        x: 10,
        y: 20,
        scale: 1,
        symbol: 'polygonA' + DELETED_NAME,
        _id: response.body.map.symbolsData[0]._id,
      },
      {
        x: 2,
        y: 2,
        scale: 1,
        symbol: 'polygonA' + DELETED_NAME,
        _id: response.body.map.symbolsData[1]._id,
      },
    ]);

    response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: createDelta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('map');
    expect(response.body.map.globalSymbolData[0].name).toEqual('polygonA');
    expect(response.body.map.symbolsData).toEqual([
      {
        x: 10,
        y: 20,
        scale: 1,
        symbol: 'polygonA',
        _id: response.body.map.symbolsData[0]._id,
      },
      {
        x: 2,
        y: 2,
        scale: 1,
        symbol: 'polygonA',
        _id: response.body.map.symbolsData[1]._id,
      },
    ]);
  });

  it('no create payload delta', async () => {
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
      globalSymbolData: [
        {
          name: 'hi',
          svg: 'place holder',
        },
      ],
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.GLOBAL_SYMBOL,
      target: [mockMap._id, mockMap.globalSymbolData.length, '-1'],
      payload: {
        name: 'd',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Malformed global symbol in CREATE');
  });
});

describe('/map/payload/ symbol payload', () => {
  beforeEach(() => {
    jest
      .spyOn(mapModel.prototype, 'save')
      .mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });
  });

  it(' symbol create', async () => {
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
      globalSymbolData: [
        {
          name: 'polygonA',
          svg: 'svgholder',
        },
      ],
      symbolsData: [],
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.SYMBOL,
      target: [mockMap._id, mockMap.symbolsData.length, '-1'],
      payload: {
        x: 10,
        y: 20,
        scale: 11,
        symbol: 'polygonA',
      },
    };

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
    expect(response.body.map.symbolsData.length).toEqual(1);
    expect(response.body.map.symbolsData).toEqual([
      {
        x: 10,
        y: 20,
        scale: 11,
        symbol: 'polygonA',
        _id: response.body.map.symbolsData[0]._id,
      },
    ]);
  });

  it(' symbol create nonexisitend global ', async () => {
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
      globalSymbolData: [],
      symbolsData: [],
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.SYMBOL,
      target: [mockMap._id, mockMap.symbolsData.length, '-1'],
      payload: {
        x: 10,
        y: 20,
        scale: 11,
        symbol: 'polygonA',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(400);

    expect(response.body.message).toBe(
      'Tried to create nonexistent symbol type',
    );
  });

  it(' symbol update', async () => {
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
      symbolsData: [
        {
          x: 10,
          y: 20,
          scale: 1,
          symbol: 'polygonA',
        },
        {
          x: 2,
          y: 2,
          scale: 1,
          symbol: 'polygonA',
        },
      ],
      globalSymbolData: [
        {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-73.935242 -40.73061 0 0"> <rect x="-73.935242" y="-40.73061" width="100%" height="100%" fill="#CCEFF1" /> </svg>',
          name: 'polygonA',
        },
      ],
    };

    const delta = {
      type: DeltaType.UPDATE,
      targetType: TargetType.SYMBOL,
      target: [mockMap._id, 0, '-1'],
      payload: {
        x: 10,
        y: 20,
        scale: 1,
        symbol: 'updated Polygon',
      },
    };

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

    expect(response.body.map.symbolsData).toEqual([
      {
        x: 10,
        y: 20,
        scale: 1,
        symbol: 'updated Polygon',
        _id: response.body.map.symbolsData[0]._id,
      },
      {
        x: 2,
        y: 2,
        scale: 1,
        symbol: 'polygonA',
        _id: response.body.map.symbolsData[1]._id,
      },
    ]);
  });
  it('symbol delete then undo delete', async () => {
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
      symbolsData: [
        {
          x: 10,
          y: 20,
          scale: 1,
          symbol: 'polygonA',
        },
        {
          x: 2,
          y: 2,
          scale: 1,
          symbol: 'polygonA',
        },
      ],
      globalSymbolData: [
        {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-73.935242 -40.73061 0 0"> <rect x="-73.935242" y="-40.73061" width="100%" height="100%" fill="#CCEFF1" /> </svg>',
          name: 'polygonA',
        },
      ],
    };

    const deleteDelta = {
      type: DeltaType.DELETE,
      targetType: TargetType.SYMBOL,
      target: [mockMap._id, 0, '-1'],
      payload: {},
    };
    const createDelta = {
      type: DeltaType.CREATE,
      targetType: TargetType.SYMBOL,
      target: [mockMap._id, 0, '-1'],
      payload: {
        x: 10,
        y: 20,
        scale: 1,
        symbol: 'polygonA',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    let response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: deleteDelta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('map');

    expect(response.body.map.symbolsData[0]).toEqual({
      x: 10,
      y: 20,
      scale: 1,
      symbol: 'polygonA' + DELETED_NAME,
      _id: response.body.map.symbolsData[0]._id,
    });

    response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: createDelta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('map');
    expect(response.body.map.symbolsData[0]).toEqual({
      x: 10,
      y: 20,
      scale: 1,
      symbol: 'polygonA',
      _id: response.body.map.symbolsData[0]._id,
    });
  });

  it('no create payload delta', async () => {
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
      symbolsData: [
        {
          x: 10,
          y: 20,
          scale: 1,
          symbol: 'polygonA',
        },
        {
          x: 2,
          y: 2,
          scale: 1,
          symbol: 'polygonA',
        },
      ],
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.SYMBOL,
      target: [mockMap._id, mockMap.symbolsData.length, '-1'],
      payload: {
        symbol: '2903',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Malformed symbol in CREATE');
  });
});

describe('/map/payload/ choropleth', () => {
  beforeEach(() => {
    jest
      .spyOn(mapModel.prototype, 'save')
      .mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });
  });

  it('cant create global chroopleth create', async () => {
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
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.GLOBAL_CHOROPLETH,
      target: [mockMap._id, 0, '-1'],
      payload: {
        minIntensity: 2,
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Cant create global choropleth');
  });
  it(' choropleth update should do ok ', async () => {
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
      globalChoroplethData: {},
    };

    const delta = {
      type: DeltaType.UPDATE,
      targetType: TargetType.GLOBAL_CHOROPLETH,
      target: [mockMap._id, 0, '-1'],
      payload: {
        minIntensity: 10,
        maxIntensity: 20000,
        minColor: '#FFFFFF',
        maxColor: '#000000',
        indexingKey: 'GDP',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(200);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('map');
    expect(response.body.map.globalChoroplethData).toEqual({
      minIntensity: 10,
      maxIntensity: 20000,
      minColor: '#FFFFFF',
      maxColor: '#000000',
      indexingKey: 'GDP',
      _id: response.body.map.globalChoroplethData._id,
    });
  });

  it(' choropleth delete cant work', async () => {
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
    };

    const delta = {
      type: DeltaType.DELETE,
      targetType: TargetType.GLOBAL_CHOROPLETH,
      target: [mockMap._id, 0, '-1'],
      payload: {
        minIntensity: 2,
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe('Cant delete global choropleth');
  });
});

describe('/map/payload/ arrow handle payload', () => {
  beforeEach(() => {
    jest
      .spyOn(mapModel.prototype, 'save')
      .mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });
  });

  it('arrow create', async () => {
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
      arrowsData: [],
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.ARROW,
      target: [mockMap._id, mockMap.arrowsData.length, '-1'],
      payload: {
        color: '#FFFFFF',
        label: 'Somestring',
        opacity: 1,
        capacity: 2000,
        interpolationPoints: [
          {
            x: 2,
            y: 3,
          },
          {
            x: 2,
            y: 3,
          },
          {
            x: 2,
            y: 3,
          },
          {
            x: 2,
            y: 3,
          },
        ],
      },
    };

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
    expect(response.body.map.arrowsData.length).toEqual(1);
    expect(response.body.map.arrowsData[0].interpolationPoints.length).toEqual(
      4,
    );
    expect(response.body.map.arrowsData[0].color).toEqual('#FFFFFF');
    expect(response.body.map.arrowsData[0].label).toEqual('Somestring');
    expect(response.body.map.arrowsData[0].opacity).toEqual(1);
    expect(response.body.map.arrowsData[0].capacity).toEqual(2000);
  });
  it('global dot update', async () => {
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
      arrowsData: [
        {
          color: '#FFFFFF',
          label: 'Somestring',
          opacity: 1,
          capacity: 2000,
          interpolationPoints: [
            {
              x: 2,
              y: 3,
            },
            {
              x: 2,
              y: 3,
            },
            {
              x: 2,
              y: 3,
            },
            {
              x: 2,
              y: 3,
            },
          ],
        },
      ],
    };

    const delta = {
      type: DeltaType.UPDATE,
      targetType: TargetType.ARROW,
      target: [mockMap._id, 0, '-1'],
      payload: {
        opacity: 0.2,
        interpolationPoints: [
          {
            x: 1,
            y: 1,
          },
          {
            x: 2,
            y: 2,
          },
          {
            x: 3,
            y: 3,
          },
          {
            x: 4,
            y: 4,
          },
        ],
      },
    };

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
    console.log('UPDATING', response.body.map.arrowsData[0]);
    expect(response.body.map.arrowsData[0].interpolationPoints).toEqual([
      {
        _id: response.body.map.arrowsData[0].interpolationPoints[0]._id,
        x: 1,
        y: 1,
      },
      {
        _id: response.body.map.arrowsData[0].interpolationPoints[1]._id,

        x: 2,
        y: 2,
      },
      {
        _id: response.body.map.arrowsData[0].interpolationPoints[2]._id,

        x: 3,
        y: 3,
      },
      {
        _id: response.body.map.arrowsData[0].interpolationPoints[3]._id,

        x: 4,
        y: 4,
      },
    ]);
    expect(response.body.map.arrowsData[0].opacity).toEqual(0.2);
  });
  it('no create payload delta', async () => {
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
      arrowsData: [
        {
          opacity: 'dak',
        },
      ],
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.ARROW,
      target: [mockMap._id, mockMap.arrowsData.length, '-1'],
      payload: {
        color: 'd',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual(
      'Found malformed arrow in create arrow',
    );
  });
});

describe('/map/payload/ labels payload', () => {
  beforeEach(() => {
    jest
      .spyOn(mapModel.prototype, 'save')
      .mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });
  });

  it(' labels update', async () => {
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
      labels: ['SINGLE', 'MINGLE'],
    };

    const delta = {
      type: DeltaType.UPDATE,
      targetType: TargetType.LABELS,
      target: [mockMap._id, 0, '-1'],
      payload: {
        labels: ['Tingles'],
      },
    };

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
    expect(response.body.map.labels.length).toEqual(1);
    expect(response.body.map.labels[0]).toEqual('Tingles');
  });

  it('cant create labels', async () => {
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
      labels: [],
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.LABELS,
      target: [mockMap._id, mockMap.symbolsData.length, '-1'],
      payload: {
        symbol: '2903',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Cant create a new label');
  });
  it('cant delete labels', async () => {
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
      labels: [],
    };

    const delta = {
      type: DeltaType.DELETE,
      targetType: TargetType.LABELS,
      target: [mockMap._id, mockMap.symbolsData.length, '-1'],
      payload: {
        symbol: '2903',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toEqual('Cant delete a new label');
  });
});

const geoJSONTemp = {
  type: 'FeatureCollection',
  name: 'VAT_adm0',
  crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:OGC:1.3:CRS84' } },
  features: [
    {
      type: 'Feature',
      properties: {
        NAME_0: 'Vatican City',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [12.455550193786678, 41.907550811767578],
            [12.455808639526367, 41.906391143798828],
            [12.457751274108944, 41.905921936035156],
            [12.45773983001709, 41.904991149902401],
            [12.457690238952637, 41.904441833496151],
            [12.457639694213981, 41.903560638427791],
            [12.457651138305664, 41.903308868408203],
            [12.457852363586369, 41.903221130371094],
            [12.458028793335075, 41.903079986572379],
            [12.458230018615779, 41.902900695800838],
            [12.458318710327148, 41.902778625488395],
            [12.458418846130428, 41.902500152588004],
            [12.458451271057186, 41.902191162109489],
            [12.45844554901123, 41.902099609375],
            [12.458441734314079, 41.902011871337891],
            [12.458400726318303, 41.901840209961051],
            [12.458248138427734, 41.901599884033203],
            [12.457938194274902, 41.901340484619254],
            [12.457651138305664, 41.901222229003963],
            [12.457490921020565, 41.901180267334098],
            [12.457232475280705, 41.901168823242244],
            [12.456929206848145, 41.901222229003963],
            [12.456668853759879, 41.901309967041072],
            [12.456549644470329, 41.901401519775391],
            [12.456428527832031, 41.901481628417912],
            [12.456101417541504, 41.901409149169922],
            [12.455701828002987, 41.90129470825201],
            [12.455020904541016, 41.901100158691349],
            [12.454368591308594, 41.900989532470817],
            [12.454130172729492, 41.900920867919979],
            [12.454058647155762, 41.900840759277401],
            [12.454066276550293, 41.900730133056697],
            [12.454079627990779, 41.90050125122076],
            [12.45421028137207, 41.900402069091911],
            [12.454220771789664, 41.900279998779297],
            [12.454158782959098, 41.900161743164062],
            [12.454058647155762, 41.900112152099609],
            [12.45385932922369, 41.900211334228629],
            [12.452890396118164, 41.90048980712902],
            [12.452880859375057, 41.900321960449332],
            [12.452751159668082, 41.900329589843693],
            [12.45121002197277, 41.90050125122076],
            [12.450670242309627, 41.900569915771598],
            [12.45056056976324, 41.900730133056697],
            [12.450299263000488, 41.900810241699276],
            [12.44981956481945, 41.900852203369141],
            [12.449630737304744, 41.900920867919979],
            [12.449379920959416, 41.900959014892692],
            [12.449090957641658, 41.900989532470817],
            [12.448760032653752, 41.900981903076286],
            [12.448772430419979, 41.900798797607536],
            [12.448259353637638, 41.900718688964787],
            [12.447900772094727, 41.900691986084041],
            [12.447810173034725, 41.900760650634879],
            [12.44768047332775, 41.900878906250114],
            [12.447789192199707, 41.900959014892692],
            [12.447910308837834, 41.90103912353527],
            [12.447590827941895, 41.901260375976676],
            [12.447249412536621, 41.901470184326229],
            [12.447010040283203, 41.901599884033203],
            [12.446628570556641, 41.901840209961051],
            [12.446459770202694, 41.901668548584041],
            [12.445969581604004, 41.901882171630916],
            [12.445608139038143, 41.901988983154297],
            [12.446769714355526, 41.902511596679744],
            [12.44719409942627, 41.902725219726619],
            [12.447280883789062, 41.902770996093864],
            [12.447420120239315, 41.902950286865234],
            [12.447528839111271, 41.903221130371094],
            [12.447610855102596, 41.90336990356451],
            [12.447759628296012, 41.903511047363338],
            [12.447969436645565, 41.903640747070312],
            [12.448210716247559, 41.903831481933594],
            [12.448430061340389, 41.903961181640568],
            [12.448561668395939, 41.904109954833984],
            [12.448648452758789, 41.904312133789176],
            [12.448748588562069, 41.904769897460938],
            [12.44884014129633, 41.905139923095817],
            [12.448989868164062, 41.905220031738338],
            [12.449209213256893, 41.905288696289006],
            [12.449471473693904, 41.905380249023494],
            [12.449790000915584, 41.905609130859432],
            [12.450058937072811, 41.905899047851562],
            [12.450250625610408, 41.906280517578125],
            [12.45038986206049, 41.906570434570426],
            [12.451349258422852, 41.906661987304688],
            [12.451869010925407, 41.906639099121094],
            [12.452028274536246, 41.906661987304688],
            [12.452738761901912, 41.9068603515625],
            [12.453030586242733, 41.906929016113338],
            [12.453179359435978, 41.906742095947266],
            [12.453799247741642, 41.906879425048942],
            [12.453769683837947, 41.907112121582088],
            [12.454191207885799, 41.907211303710938],
            [12.455550193786678, 41.907550811767578],
          ],
        ],
      },
    },
  ],
};

describe('/map/payload/ map geojson', () => {
  beforeEach(() => {
    jest
      .spyOn(mapModel.prototype, 'save')
      .mockImplementation(function (this: any) {
        return Promise.resolve(this);
      });

    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(geoJSONTemp));

    jest.spyOn(fs, 'writeFileSync').mockReturnValue(undefined);
  });

  it('geojson create', async () => {
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
      geoJSON: 'some/path',
    };

    const delta = {
      type: DeltaType.CREATE,
      targetType: TargetType.GEOJSONDATA,
      target: [mockMap._id, -1, 'new properties'],
      payload: {
        propertyValue: 'NEW VALUE',
      },
    };

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mockMap);

    const response = await supertest(app)
      .put('/map/map/payload')
      .send({ delta: delta })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    console.log(JSON.stringify(response.body));
    expect(response.statusCode).toBe(200);
    expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
    expect(fs.readFileSync).toHaveBeenCalledTimes(1);
  });
  it('geojson update', async () => {
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
    };

    const delta = {
      type: DeltaType.UPDATE,
      targetType: TargetType.GEOJSONDATA,
      target: [mockMap._id, 0, 'NAME_0'],
      payload: {
        propertyValue: 'Some city idk where',
      },
    };

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
  });

  it('geojson delete', async () => {
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
    };

    const delta = {
      type: DeltaType.DELETE,
      targetType: TargetType.GEOJSONDATA,
      target: [mockMap._id, -1, 'NAME_0'],
      payload: {},
    };

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
  });
});

afterEach(() => {
  // Reset mock after the test
  jest.clearAllMocks();
});
