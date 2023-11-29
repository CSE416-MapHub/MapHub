import supertest from 'supertest';
import app from '../app';
import userModel from '../models/user-model';
import mongoose from 'mongoose';
import fs from 'fs';

beforeEach(() => {
  jest.clearAllMocks();

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
      _id: mockId.toString(),
      username: userData.username,
      email: userData.email,
      profilePic: Buffer.from(fs.readFileSync('./tests/fixtures/avatar.jpg')),
    };
    userModel.prototype.save = jest.fn().mockResolvedValue(savedUser);

    const response = await supertest(app).post('/auth/register').send(userData);

    expect(response.statusCode).toBe(200);

    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toEqual({
      id: mockId.toString(),
      username: userData.username,
      profilePic: Buffer.from(
        fs.readFileSync('./tests/fixtures/avatar.jpg'),
      ).toString('base64'),
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
afterEach(() => {
  // Reset mock after the test
  jest.restoreAllMocks();
});

describe('GET /auth/profile-picture ', () => {
  const mockId = new mongoose.Types.ObjectId();
  const mockUser = {
    _id: mockId.toString(),
    username: 'someUser',
    email: 'someUser@gmail.com',
    profilePic: Buffer.from(fs.readFileSync('./tests/fixtures/avatar.jpg')),
    password: '********',
    maps: [],
  };

  beforeEach(() => {
    jest.mock('../models/user-model');
  });

  it('should return a base-64 encoded string.', async () => {
    jest.mock('../models/user-model');

    (userModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const response = await supertest(app)
      .get('/auth/profile-picture')
      .send({ id: mockId });
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('profilePic');
    expect(response.body.profilePic).toBe(
      Buffer.from(fs.readFileSync('./tests/fixtures/avatar.jpg')).toString(
        'base64',
      ),
    );
  });

  it('should return a bad request if there is no ID.', async () => {
    const response = await supertest(app).get('/auth/profile-picture').send({});
    expect(response.statusCode).toBe(400);
  });

  it('should return a bad request if there is no user in the database.', async () => {
    (userModel.findById as jest.Mock).mockResolvedValue(null);

    const response = await supertest(app).get('/auth/profile-picture').send({
      id: new mongoose.Types.ObjectId(),
    });

    expect(response.statusCode).toBe(400);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});

describe('GET /auth/exists', () => {
  const mockId = new mongoose.Types.ObjectId();
  const mockUsername = 'someUser';
  const mockUser = {
    _id: mockId.toString(),
    username: mockUsername,
    email: 'someUser@gmail.com',
    profilePic: Buffer.from(fs.readFileSync('./tests/fixtures/avatar.jpg')),
    password: '********',
    maps: [],
  };

  beforeEach(() => {
    jest.mock('../models/user-model');
  });

  it('should return a true message if the user exists in the database.', async () => {
    (userModel.exists as jest.Mock).mockResolvedValue(mockUser);

    const response = await supertest(app).get('/auth/exists').send({
      username: mockUsername,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      success: true,
      username: mockUsername,
      exists: true,
    });
  });

  it('should return a false message if the user does not exist in the database.', async () => {
    (userModel.exists as jest.Mock).mockResolvedValue(null);

    const response = await supertest(app).get('/auth/exists').send({
      username: mockUsername,
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      success: true,
      username: mockUsername,
      exists: false,
    });
  });

  it('should send a bad request when the request has an empty body.', async () => {
    const response = await supertest(app).get('/auth/exists').send({});
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(false);
  });
});
afterEach(() => {
  // Reset mock after the test
  jest.clearAllMocks();
});
