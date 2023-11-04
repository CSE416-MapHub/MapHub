import request from 'supertest';
import app from '../index.ts';

describe('User Registration API', () => {
  it('should register a new user', async () => {
    const response = await request(app).post('/api/register').send({
      username: 'testuser',
      password: 'testpassword',
    });

    expect(response.status).toBe(201);
    // Add more assertions as needed
  });
});
