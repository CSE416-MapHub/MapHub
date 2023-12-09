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
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-73.935242 -40.73061 0 0"> <rect x="-73.935242" y="-40.73061" width="100%" height="100%" fill="#CCEFF1" /> </svg>',
        owner: mockMaps[2].owner.toString(),
        published: mockMaps[2].published,
      },
      {
        _id: mockMaps[1]._id.toString(),
        title: mockMaps[1].title,
        svg: '<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-73.935242 -40.73061 0 0"> <rect x="-73.935242" y="-40.73061" width="100%" height="100%" fill="#CCEFF1" /> </svg>',
        owner: mockMaps[1].owner.toString(),
        published: mockMaps[1].published,
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

  it('update title of map', async () => {
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

afterEach(() => {
  // Reset mock after the test
  jest.clearAllMocks();
});
