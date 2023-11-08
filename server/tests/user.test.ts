import request from 'supertest';
import app from '../index';
import * as db from './db'
import mongoose from 'mongoose';

beforeAll(async () => {

  await db.connect()
});
afterEach(async () => {
  await db.clearDatabase()
});
afterAll(async () => {
  await db.closeDatabase()
});

//we test using the same email all the time so we want t osee if the duplcation works
describe('User Registration API', () => {

  it('should register a new user', async () => {
    const response = await request(app).post('/auth/register').send({
      username: 'testuser',
      email: 'mapperhubbers@gmail.com',
      password: 'test!P1assword',
      passwordVerify:'test!P1assword'
    });
    expect(response.status).toBe(200);

  });
});

describe('User Retrieval API', () => {
  it('should retrieve all registered users', async () => {
    const response = await request(app).get('/auth/users').send({
    });

    expect(response.status).toBe(200);
  });
});

