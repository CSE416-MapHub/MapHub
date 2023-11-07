import request from 'supertest';
import app from '../index';

//we test using the same email all the time so we want t osee if the duplcation works
describe('User Registration API', () => {
  it('should register a new user', async () => {
    const response = await request(app).post('/auth/register').send({
      username: 'testuser',
      email: 'mapperhubbers@gmail.com',
      password: 'test!P1assword',
      passwordVerify:'test!P1assword'
    });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      errorMessage: 'Username already in use.',
    });
  });
});

describe('User Retrieval API', () => {
  it('should retrieve all registered users', async () => {
    const response = await request(app).get('/auth/users').send({
    });

    expect(response.status).toBe(200);
  });
});
