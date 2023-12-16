import supertest from 'supertest';
import auth from '../auth/index';
import app from '../app';
import bcrypt from 'bcrypt';
import userModel from '../models/user-model';
import mongoose from 'mongoose';
import fs from 'fs';
import nodemailer from 'nodemailer';

jest.mock('bcrypt');
jest.mock('../models/user-model');
jest.mock('../auth/index');
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

describe('POST /auth/login', () => {
  beforeEach(() => {
    jest.mock('bcrypt');
    jest.mock('../auth/index');
    jest.mock('../models/user-model');
  });

  it('should return the user and a cookie on a successful login.', async () => {
    const mockId = new mongoose.Types.ObjectId();
    const mockUsername = 'someUser';
    const mockProfilePic = Buffer.from(
      fs.readFileSync('./tests/fixtures/avatar.jpg'),
    );

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (auth.signToken as jest.Mock).mockReturnValue('someJWTEncryptedToken');
    (userModel.findOne as jest.Mock).mockResolvedValue({
      _id: mockId,
      username: mockUsername,
      email: 'someUser@gmail.com',
      profilePic: mockProfilePic,
      password: '********',
      maps: [],
    });

    const response = await supertest(app).post('/auth/login').send({
      username: 'someUser',
      password: '********',
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      success: true,
      user: {
        id: mockId.toString(),
        username: mockUsername,
        profilePic: Buffer.from(mockProfilePic).toString('base64'),
      },
    });
    expect(response.headers['set-cookie'][0]).toMatch(
      `token=someJWTEncryptedToken`,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
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

    expect(response.statusCode).toBe(404);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(false);
  });
});

describe('PUT /auth/profile-picture', () => {
  const mockUser = {
    _id: '65677439126531bcfbbe2c10',
    username: 'someUser',
    email: 'someUser@gmail.com',
    profilePic: Buffer.from('', 'base64'),
    password: '********',
    maps: [],
    save: jest.fn().mockResolvedValue(this),
  };

  beforeEach(() => {
    jest.mock('../models/user-model');
    jest.mock('../auth/index');
    (auth.verify as jest.Mock).mockImplementation((request, response, next) => {
      request.userId = '65677439126531bcfbbe2c10';
      return next();
    });
  });

  it('returns the user when a profile picture is successfully edited.', async () => {
    (userModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const response = await supertest(app)
      .put('/auth/profile-pic')
      .send({
        profilePic: Buffer.from(
          fs.readFileSync('./tests/fixtures/avatar.jpg'),
        ).toString('base64'),
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toStrictEqual({
      success: true,
      user: {
        id: '65677439126531bcfbbe2c10',
        username: 'someUser',
        profilePic: Buffer.from(
          fs.readFileSync('./tests/fixtures/avatar.webp'),
        ).toString('base64'),
      },
    });
  });

  it('returns a bad request response if there is an empty body.', async () => {
    const response = await supertest(app).put('/auth/profile-pic').send({});

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('errorCode');
    expect(response.body.errorCode).toBe(1);
    expect(response.body).toHaveProperty('errorMessage');
  });

  it('returns a bad request response if there is no user.', async () => {
    (userModel.findById as jest.Mock).mockResolvedValue(null);

    const response = await supertest(app)
      .put('/auth/profile-pic')
      .send({
        profilePic: Buffer.from(
          fs.readFileSync('./tests/fixtures/avatar.jpg'),
        ).toString('base64'),
      });

    expect(response.statusCode).toBe(400);
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(false);
    expect(response.body).toHaveProperty('errorCode');
    expect(response.body.errorCode).toBe(2);
    expect(response.body).toHaveProperty('errorMessage');
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

describe('POST /auth/request-reset-password ', () => {
  const mockUser = {
    _id: '65677439126531bcfbbe2c10',
    username: 'someUser',
    email: 'someUser@gmail.com',
    profilePic: Buffer.from(fs.readFileSync('./tests/fixtures/avatar.jpg')),
    password: '********',
    maps: [],
    resetPasswordToken: undefined,
    resetPasswordExpires: undefined,
    save: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send a login response if cookies are correct.', async () => {
    (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
    const mockedSendMail = jest.fn();

    jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: mockedSendMail,
    } as unknown as nodemailer.Transporter);

    const response = await supertest(app)
      .post('/auth/request-reset-password')
      .send({
        email: 'someUser@gmail.com',
      });

    const urlRegex = /^http:\/\/maphub\.pro\/reset-password\/[A-Za-z0-9-_]+$/;

    expect(response.statusCode).toBe(200);
    const resetURL = response.body.resetURL;
    console.log('Tis is the reset url', resetURL);
    expect(resetURL).toMatch(urlRegex);
  });
});

describe('GET /auth/reset-password/:token ', () => {
  const mockUser = {
    _id: '65677439126531bcfbbe2c10',
    username: 'someUser',
    email: 'someUser@gmail.com',
    profilePic: Buffer.from(fs.readFileSync('./tests/fixtures/avatar.jpg')),
    password: '********',
    resetPasswordToken: 'd1124155c4555cbd5a2486cee58b089ac64b7651',
    resetPasswordExpires: Date.now(),
    maps: [],
    save: jest.fn().mockReturnThis(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send a login response if cookies are correct.', async () => {
    (userModel.findOne as jest.Mock).mockResolvedValue(mockUser);
    const response = await supertest(app)
      .post(`/auth/reset-password/${mockUser.resetPasswordToken}`)
      .send({ password: 'iofoiad21314jiof' });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('user');
    console.log('Password resetted user', response.body.user);
    expect(response.body.user.resetPasswordToken).toEqual(undefined);
    expect(response.body.user.resetPasswordExpires).toEqual(undefined);
    expect(response.body.user.password).not.toEqual('********');
  });
});

afterEach(() => {
  // Reset mock after the test
  jest.clearAllMocks();
});
