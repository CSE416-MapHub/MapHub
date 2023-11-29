import supertest from 'supertest';
import auth from '../auth/index';
import app from '../app';
import userModel from '../models/user-model';
import mongoose from 'mongoose';
import fs from 'fs';

jest.mock('../auth/index');
jest.mock('../models/user-model');
beforeAll(() => {
  jest.setTimeout(6000);
  jest.clearAllMocks();
});

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

    const response = await supertest(app).get(
      `/auth/exists?username=${mockUsername}`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      success: true,
      username: mockUsername,
      exists: true,
    });
  });

  it('should return a false message if the user does not exist in the database.', async () => {
    (userModel.exists as jest.Mock).mockResolvedValue(null);

    const response = await supertest(app).get(
      `/auth/exists?username=${mockUsername}`,
    );

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      success: true,
      username: mockUsername,
      exists: false,
    });
  });

  it('should send a bad request when the request has empty query parameters.', async () => {
    const response = await supertest(app).get('/auth/exists');
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(false);
  });
});
afterEach(() => {
  // Reset mock after the test
  jest.clearAllMocks();
});

describe('POST /auth/username', () => {
  const mockId = new mongoose.Types.ObjectId();
  const mockUsername = 'someUser';
  const mockNewUsername = 'anotherUser';
  const mockUser = {
    _id: mockId.toString(),
    username: mockUsername,
    email: 'someUser@gmail.com',
    profilePic: Buffer.from(fs.readFileSync('./tests/fixtures/avatar.jpg')),
    password: '********',
    maps: [],
  };
  const mockExistingUser = {
    _id: new mongoose.Types.ObjectId(),
    username: mockNewUsername,
    email: 'anotherUser@gmail.com',
    profilePic: Buffer.from(fs.readFileSync('./tests/fixtures/avatar.jpg')),
    password: '********',
    maps: [],
  };

  beforeEach(() => {
    jest.mock('../models/user-model');
    jest.mock('../auth/index');
    (auth.verify as jest.Mock).mockImplementation((request, response, next) => {
      request.userId = mockId.toString();
      return next();
    });
  });

  it('should change the username.', async () => {
    (userModel.findById as jest.Mock).mockResolvedValue({
      ...mockUser,
      save: jest.fn().mockResolvedValue(this),
    });
    (userModel.exists as jest.Mock).mockResolvedValue(null);

    const response = await supertest(app).post('/auth/username').send({
      username: mockNewUsername,
    });
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      success: true,
      user: {
        id: mockUser._id,
        username: mockNewUsername,
        profilePic: mockUser.profilePic.toString('base64'),
      },
    });
  });

  it('should return bad request if the body is empty.', async () => {
    const response = await supertest(app).post('/auth/username').send({});
    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(false);
  });

  it('should return bad request if the username is already in use.', async () => {
    (userModel.exists as jest.Mock).mockResolvedValue(mockExistingUser);

    const response = await supertest(app).post('/auth/username').send({
      username: mockNewUsername,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(false);
  });

  it('should return bad request if the user does not exist.', async () => {
    (userModel.findById as jest.Mock).mockResolvedValue(null);
    (userModel.exists as jest.Mock).mockResolvedValue(null);

    const response = await supertest(app).post('/auth/username').send({
      username: mockNewUsername,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(false);
  });
});

describe('GET /auth/verify ', () => {
  const mockUser = {
    _id: '65677439126531bcfbbe2c10',
    username: 'someUser',
    email: 'someUser@gmail.com',
    profilePic: Buffer.from(fs.readFileSync('./tests/fixtures/avatar.jpg')),
    password: '********',
    maps: [],
  };
  const anotherMockUser = {
    _id: '656775b4ec8174179a7d9e82',
    username: 'anotherUser',
    email: 'anotherUser@gmail.com',
    profilePic: Buffer.from(fs.readFileSync('./tests/fixtures/avatar.jpg')),
    password: '********',
    maps: [],
  };

  beforeEach(() => {
    jest.mock('../models/user-model');
    jest.mock('../auth/index');
  });

  it('should send a login response if cookies are correct.', async () => {
    (auth.verifyUser as jest.Mock).mockResolvedValue({
      userId: mockUser._id,
    });
    (userModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const response = await supertest(app).get('/auth/verify');

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      isLoggedIn: true,
      user: {
        id: mockUser._id,
        username: mockUser.username,
        profilePic: mockUser.profilePic.toString('base64'),
      },
    });
  });

  it('should send a not logged in response if cookies include an invalid user ID.', async () => {
    (auth.verifyUser as jest.Mock).mockResolvedValue({
      userId: anotherMockUser._id,
    });
    (userModel.findById as jest.Mock).mockResolvedValue(null);

    const response = await supertest(app).get('/auth/verify');

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      isLoggedIn: false,
      user: null,
    });
  });

  it('should send a not logged in response if cookies are unverifiable.', async () => {
    (auth.verifyUser as jest.Mock).mockResolvedValue(null);

    const response = await supertest(app).get('/auth/verify');
    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      isLoggedIn: false,
      user: null,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});

afterEach(() => {
  // Reset mock after the test
  jest.clearAllMocks();
});
