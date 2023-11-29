import supertest from 'supertest';
import app from '../app';
import postModel from '../models/post-model';
import userModel from '../models/user-model';
import mongoose from 'mongoose';
import auth from '../auth/index';
import mapModel from '../models/map-model';
const mockUserID = new mongoose.Types.ObjectId();

beforeEach(() => {
  jest.setTimeout(6000);
  jest.clearAllMocks();

  jest.spyOn(userModel, 'findById').mockResolvedValue({ id: mockUserID });
});
afterEach(() => {
  // Reset mock after the test
  jest.clearAllMocks();
});

describe('POST /posts/publish', () => {
  it('publishing a map into a post', async () => {
    const mockMap = {
      title: 'Blah blah',
      _id: new mongoose.Types.ObjectId(),
      published: false,
      save: jest
        .spyOn(mapModel.prototype, 'save')
        .mockImplementation(function (this: any) {
          console.log('POST: saving the edited map', this);
          return Promise.resolve(this);
        }),
    };

    jest
      .spyOn(postModel.prototype, 'save')
      .mockImplementation(function (this: any) {
        console.log('post saving hte post', this);
        return Promise.resolve(this);
      });

    jest.spyOn(mapModel, 'findById').mockImplementation((id: any) => {
      const queryLikeObject = {
        exec: jest.fn().mockResolvedValue(mockMap),
      };
      return queryLikeObject as any;
    });

    const response = await supertest(app)
      .post(`/posts/publish/`)
      .send({
        mapID: mockMap._id,
        title: 'Ukranian War',
        description: 'Grueling wars :(',
      })
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('post');
    expect(response.body).toHaveProperty('success');
    expect(response.body.success).toBe(true);
  });
});

describe('GET /posts/all', () => {
  it('queries posts based on a search term', async () => {
    const mockPosts = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'aLL long in War ku dynasty',
        description: 'Description for Post 1',
        map: new mongoose.Types.ObjectId(),
        owner: mockUserID,
        comments: [new mongoose.Types.ObjectId()], // Array of comment ObjectIds
        likes: [mockUserID], // Array of user ObjectIds who liked the post
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'han dynasty',
        description: 'Description for Post 2',
        map: new mongoose.Types.ObjectId(),
        owner: mockUserID,
        comments: [], // Assuming no comments
        likes: [], // Assuming no likes
      },
    ];

    const returnMock = [
      {
        title: mockPosts[0].title,
        description: mockPosts[0].description,
        postID: mockPosts[0]._id,
        mapID: mockPosts[0].map,
        png: { type: 'Buffer', data: [] },
      },
    ];

    const mapData = {
      _id: new mongoose.Types.ObjectId(),
    };

    const queryMock: any = {
      exec: jest.fn().mockResolvedValue([mockPosts[0]]),
    };

    jest.spyOn(postModel, 'find').mockImplementation(() => queryMock);

    jest.spyOn(mapModel, 'findById').mockImplementation((id: any) => {
      const queryLikeObject = {
        exec: jest.fn().mockResolvedValue(mapData),
      };
      return queryLikeObject as any;
    });

    // Make the GET request
    const searchQuery = 'dynasty';
    const response = await supertest(app)
      .get(`/posts/all?searchQuery=${searchQuery}`)
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('posts');

    expect(response.body.posts[0].title).toEqual(returnMock[0].title);
  });
});

describe('GET /posts/user', () => {
  it('gets all the user owned posts', async () => {
    const mockPosts = [
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'aLL long in War ku dynasty',
        description: 'Description for Post 1',
        map: new mongoose.Types.ObjectId(),
        owner: mockUserID,
        comments: [new mongoose.Types.ObjectId()], // Array of comment ObjectIds
        likes: [mockUserID], // Array of user ObjectIds who liked the post
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'han dynasty',
        description: 'Description for Post 2',
        map: new mongoose.Types.ObjectId(),
        owner: mockUserID,
        comments: [], // Assuming no comments
        likes: [], // Assuming no likes
      },
    ];

    const mapData = {
      _id: new mongoose.Types.ObjectId(),
    };

    const queryMock: any = {
      exec: jest.fn().mockResolvedValue(mockPosts),
    };
    const username = 'randUsername';

    jest.spyOn(postModel, 'find').mockImplementation(() => queryMock);
    jest.spyOn(mapModel, 'findById').mockImplementation((id: any) => {
      const queryLikeObject = {
        exec: jest.fn().mockResolvedValue(mapData),
      };
      return queryLikeObject as any;
    });

    // Make the GET request
    const response = await supertest(app)
      .get(`/posts/user?username=${username}`)
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('posts');
    console.log(
      'ALL THE MAPS OWNED BY USER',
      JSON.stringify(response.body.posts),
    );
    expect(response.body.posts[0].title).toEqual('aLL long in War ku dynasty');
    expect(response.body.posts[1].title).toEqual('han dynasty');
  });
});
