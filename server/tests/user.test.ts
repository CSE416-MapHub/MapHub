import request from 'supertest';
import app from '../index.ts';
import "@types/jest"

describe('User Registration API', () => {
  it('should register a new user', async () => {
    const response = await request(app).post('/api/register').send({
      username: 'testuser',
      password: 'testpassword',
    });

    expect(response.status).toBe(201);
  });
});
