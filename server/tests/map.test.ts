import supertest from 'supertest';
import app from '../index';
import { startServer, stopServer } from './testServer';
import mapModel from '../models/map-model';
import mongoose from 'mongoose';
import auth from '../auth/index';

beforeAll(async () => {
  console.log('STARTING SERVER IN MAP');
  await startServer(); // Choose your test port
});

afterAll(async () => {
  console.log('CLOSING SERVER IN MAP');

  await stopServer();
});
beforeEach(() => {
  jest.setTimeout(6000);
});

jest.mock('../models/map-model');

describe('POST /map/map', () => {
  it('create a new map', async () => {
    const mapData = {
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
    };

    const mockId = new mongoose.Types.ObjectId();
    const userId = 'oihwefhioefhifihehrhieo';
    const savedMap = {
      _id: mockId,
    };
    mapModel.prototype.save = jest.fn().mockResolvedValue(savedMap);

    const response = await supertest(app)
      .post('/map/map')
      .send(mapData)
      .set('Cookie', [`token=${auth.signToken(userId)}`]);

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty('map');
  });
});
