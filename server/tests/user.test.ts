import supertest from 'supertest';
import app from '../index';
import { startServer, stopServer } from './testServer';
import userModel from '../models/user-model';
import mongoose from 'mongoose';

beforeAll(async () => {
  await startServer(); // Choose your test port
});

afterAll(async () => {
  await stopServer();
});
beforeEach(() => {
  jest.setTimeout(6000);
});

jest.mock('../models/user-model');

describe('POST /auth/register', () => {
  it('should register a new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'mapperhubbers@gmail.com',
      password: 'test!P1assword',
      passwordVerify: 'test!P1assword',
    };

    const mockId = new mongoose.Types.ObjectId();

    const savedUser = {
      _id: mockId,
      username: userData.username,
      email: userData.email,
    };
    userModel.prototype.save = jest.fn().mockResolvedValue(savedUser);

    const response = await supertest(app).post('/auth/register').send(userData);

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toEqual({
      username: savedUser.username,
      email: savedUser.email,
    });
  });
  it('no body provided', async () => {
    const userData = {};

    userModel.prototype.save = jest.fn().mockResolvedValue(null);

    const response = await supertest(app).post('/auth/register').send(userData);

    expect(response.statusCode).toBe(400);
    expect(response.body.errorMessage).toEqual(
      'Please enter all required fields.',
    );
  });

  // it('password less than 8 characters', async () => {
  //   const userData = {
  //     username: 'testuser',
  //     email: 'mapperhubbers@gmail.com',
  //     password: 'test!P1',
  //     passwordVerify: 'test!P1',
  //   };

  //   userModel.prototype.save = jest.fn().mockResolvedValue(null);

  //   const response = await supertest(app).post('/auth/register').send(userData);

  //   expect(response.statusCode).toBe(400);
  //   expect(response.body.errorMessage).toEqual(
  //     'Please enter a password of at least 8 characters.',
  //   );
  // });
  // it('password doesnt match', async () => {
  //   const userData = {
  //     username: 'testuser',
  //     email: 'mapperhubbers@gmail.com',
  //     password: 'test!P1assword',
  //     passwordVerify: 'test!Passwords',
  //   };

  //   userModel.prototype.save = jest.fn().mockResolvedValue(null);

  //   const response = await supertest(app).post('/auth/register').send(userData);

  //   expect(response.statusCode).toBe(400);
  //   expect(response.body.errorMessage).toEqual(
  //     'Please enter the same password twice.',
  //   );
  // });
});

describe('User Retrieval API', () => {
  it('should retrieve all registered users', async () => {
    // Mock response for userModel.find
    (userModel.find as jest.Mock).mockResolvedValue([]);

    const response = await supertest(app).get('/auth/users');

    expect(response.status).toBe(200);
    expect(userModel.find).toHaveBeenCalled();
  });
});
