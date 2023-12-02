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

jest.mock('../models/post-model');

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
        title: 'some map thats kinda cool',
        description: 'Description for map',
        map: new mongoose.Types.ObjectId(),
        owner: new mongoose.Types.ObjectId(),
        comments: [], // Assuming no comments
        likes: [], // Assuming no likes
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

    const mockMaps = [
      {
        _id: mockPosts[0].map,
      },
      {
        _id: mockPosts[2].map,
      },
      {
        _id: mockPosts[1].map,
      },
    ];
    const searchQuery = 'dynasty';

    jest.spyOn(postModel, 'find').mockImplementation(
      () =>
        ({
          exec: jest.fn().mockImplementation(() => {
            return Promise.resolve(
              mockPosts.filter(post => post.title.includes(searchQuery)),
            );
          }),
        } as any),
    );

    jest
      .spyOn(mapModel, 'findById')
      .mockImplementation((id: mongoose.Types.ObjectId | string) => {
        const result = mockMaps.find(
          map => map._id.toString() === id.toString(),
        );
        return { exec: jest.fn().mockResolvedValue(result) } as any;
      });

    // Make the GET request
    const response = await supertest(app)
      .get(`/posts/all?searchQuery=${searchQuery}`)
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('posts');
    expect(response.body.posts.length).toEqual(2);
    expect(response.body.posts[0].title).toEqual(mockPosts[0].title);
    expect(response.body.posts[1].title).toEqual(mockPosts[2].title);
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
        title: 'some map thats kinda cool',
        description: 'Description for map',
        map: new mongoose.Types.ObjectId(),
        owner: new mongoose.Types.ObjectId(),
        comments: [], // Assuming no comments
        likes: [], // Assuming no likes
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

    const mockMaps = [
      {
        _id: mockPosts[0].map,
      },
      {
        _id: mockPosts[2].map,
      },
      {
        _id: mockPosts[1].map,
      },
    ];

    jest.spyOn(postModel, 'find').mockImplementation(
      () =>
        ({
          exec: jest.fn().mockImplementation(() => {
            return Promise.resolve(
              mockPosts.filter(
                post => post.owner.toString() === mockUserID.toString(),
              ),
            );
          }),
        } as any),
    );

    jest
      .spyOn(mapModel, 'findById')
      .mockImplementation((id: mongoose.Types.ObjectId | string) => {
        const result = mockMaps.find(
          map => map._id.toString() === id.toString(),
        );
        return { exec: jest.fn().mockResolvedValue(result) } as any;
      });

    // Make the GET request
    const response = await supertest(app)
      .get(`/posts/user/${mockUserID}`)
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    // Assertions
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('posts');
    console.log(
      'ALL THE MAPS OWNED BY USER',
      JSON.stringify(response.body.posts),
    );
    expect(response.body.posts.length).toEqual(2);

    expect(response.body.posts[0].title).toEqual('aLL long in War ku dynasty');
    expect(response.body.posts[0].mapID.toString()).toEqual(
      mockMaps[0]._id.toString(),
    );
    expect(response.body.posts[1].title).toEqual('han dynasty');
    expect(response.body.posts[1].mapID.toString()).toEqual(
      mockMaps[1]._id.toString(),
    );
  });
});

describe('GET /posts/:postId', () => {
  it('gets post by ID with populated comments and associated map', async () => {
    // Set up some mock data
    const mockPostId = new mongoose.Types.ObjectId();
    const mockMapId = new mongoose.Types.ObjectId();
    const mockComments = [
      {
        _id: new mongoose.Types.ObjectId(),
        user: new mongoose.Types.ObjectId(),
        content: 'this is a comment',
        replies: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
        likes: [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()],
      },
    ];
    const mockPosts = [
      {
        _id: mockPostId,
        title: 'Post1',
        description: 'Some decscsiorion',
        map: mockMapId,
        owner: new mongoose.Types.ObjectId(),
        comments: [],
        likes: [new mongoose.Types.ObjectId()],
      },
      {
        _id: new mongoose.Types.ObjectId(),
        title: 'Post2',
        description: 'POST 2',
        map: new mongoose.Types.ObjectId(),
      },
    ];

    const mockMaps = [
      {
        _id: mockMapId,
        // other map properties
      },
      {
        _id: mockPosts[1],
        // other map properties
      },
    ];

    jest
      .spyOn(postModel, 'findById')
      .mockImplementation((postId: mongoose.Types.ObjectId | string) => {
        const execMock = jest.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId(postId),
          map: mockMapId,
          comments: mockComments, // Assuming comments are already populated
          populate: jest.fn().mockReturnThis(), // Chainable populate method
          exec: jest.fn().mockResolvedValue({}),
        });

        return { populate: jest.fn().mockReturnThis(), exec: execMock } as any;
      });

    jest
      .spyOn(mapModel, 'findById')
      .mockImplementation((id: mongoose.Types.ObjectId | string) => {
        const result = mockMaps.find(
          map => map._id.toString() === id.toString(),
        );
        return { exec: jest.fn().mockResolvedValue(result) } as any;
      });

    const response = await supertest(app)
      .get(`/posts/post/${mockMapId}`)
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('posts');
    console.log(response.body.posts);
    expect(response.body.posts.comments[0].content).toEqual(
      'this is a comment',
    );
  });
});
