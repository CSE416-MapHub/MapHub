import supertest from 'supertest';
import app from '../app';
import postModel from '../models/post-model';
import userModel from '../models/user-model';
import mongoose from 'mongoose';
import auth from '../auth/index';
import mapModel from '../models/map-model';
import { LikeChange } from '../controllers/post-controller';
import commentModel from '../models/comment-model';
import fs from 'fs';

const mockUserID = new mongoose.Types.ObjectId();

let mapData = {
  _id: new mongoose.Types.ObjectId(),
  title: 'mapNice',
  owner: new mongoose.Types.ObjectId(),
  mapType: 'categorical',
  published: false,
  labels: [],
  globalChoroplethData: {
    minIntensity: 0,
    maxIntensity: 0,
    minColor: '',
    maxColor: '',
    indexingKey: '',
  },
  globalCategoryData: [],
  globalSymbolData: [],
  globalDotDensityData: [],
  regionsData: [],
  symbolsData: [],
  dotsData: [],
  arrowsData: [],
  geoJSON: 'some/path/jijie38920rj83232.geojson',
  updatedAt: Math.floor(new Date().getTime() * Math.random()),
  createdAt: new Date().getTime(),
};

const geoJSONTemp = {
  type: 'Feature',
  geometry: { type: 'Point', coordinates: [-73.935242, 40.73061] },
  properties: { name: 'Point', description: 'description point' },
};

beforeEach(() => {
  jest.setTimeout(6000);
  jest.clearAllMocks();
  jest.mock('fs');

  jest
    .spyOn(fs.promises, 'readFile')
    .mockResolvedValue(JSON.stringify(geoJSONTemp));
  jest.spyOn(userModel, 'findById').mockResolvedValue({
    id: mockUserID,
    maps: [],
    save: jest.fn().mockReturnThis(),
  });
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
      save: jest.spyOn(mapModel.prototype, 'save').mockImplementation(function (
        this: any,
      ) {
        console.log('POST: saving the edited map', this);
        return Promise.resolve(this);
      }),
    };

    jest.spyOn(postModel.prototype, 'save').mockImplementation(function (
      this: any,
    ) {
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
        ...mapData,
        _id: mockPosts[0].map,
        geoJSON: '../jsonStore/655d7d37b8c84d31ceeecf81.geojson',
      },
      {
        ...mapData,
        _id: mockPosts[2].map,
        geoJSON: '../jsonStore/655d7d37b8c84d31ceeecf81.geojson',
      },
      {
        ...mapData,
        _id: mockPosts[1].map,
        geoJSON: '../jsonStore/655d7d37b8c84d31ceeecf81.geojson',
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
        }) as any,
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
        ...mapData,
        _id: mockPosts[0].map,
      },
      {
        ...mapData,
        _id: mockPosts[2].map,
      },
      {
        ...mapData,
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
        }) as any,
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
        user: {
          id: new mongoose.Types.ObjectId(),
          username: 'aUser',
          profilePic: Buffer.alloc(0),
        },
        content: 'this is a comment',
        replies: [],
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
        ...mapData,
        _id: mockMapId,
        geoJSON: '../jsonStore/655d7d37b8c84d31ceeecf81.geojson',

        // other map properties
      },
      {
        ...mapData,
        _id: mockPosts[1],
        geoJSON: '../jsonStore/655d7d37b8c84d31ceeecf81.geojson',

        // other map properties
      },
    ];

    jest
      .spyOn(postModel, 'findById')
      .mockImplementation((postId: mongoose.Types.ObjectId | string) => {
        const execMock = jest.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId(postId),
          map: mockMapId,
          owner: {
            id: new mongoose.Types.ObjectId(),
            username: 'aUser',
            profilePic: Buffer.alloc(0),
          },
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
    expect(response.body).toHaveProperty('post');
    console.log(response.body.post);
    expect(response.body.post.comments[0].content).toEqual('this is a comment');
  });
});

describe('POST /posts/comments/:postId', () => {
  it('creating a comment in a post', async () => {
    jest.spyOn(commentModel.prototype, 'save').mockImplementation(function (
      this: any,
    ) {
      console.log('post saving hte post', this);
      return Promise.resolve(this);
    });
    const mockPostId = new mongoose.Types.ObjectId();
    const mockMapId = new mongoose.Types.ObjectId();
    const mockPost = {
      _id: mockPostId,
      title: 'Post1',
      description: 'Some decscsiorion',
      map: mockMapId,
      owner: new mongoose.Types.ObjectId(),
      comments: [],
      likes: [new mongoose.Types.ObjectId()],
      save: jest.fn().mockReturnValue({}),
    };

    jest.spyOn(postModel, 'findById').mockImplementation((id: any) => {
      return mockPost as any;
    });

    const response = await supertest(app)
      .post(`/posts/comments/${mockPostId}/`)
      .send({
        content: 'THIS NEW COMMENT BABYY',
      })
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('comment');
    expect(response.body.comment.content).toEqual('THIS NEW COMMENT BABYY');
    expect(response.body.comment.user).toEqual(mockUserID.toString());
    expect(response.body.comment.likes).toEqual([]);
    expect(response.body.comment.replies).toEqual([]);
  });
});

describe('PATCH /posts/post/likeChange', () => {
  const mockPostId = new mongoose.Types.ObjectId();
  const mockMapId = new mongoose.Types.ObjectId();

  it('adding user like', async () => {
    const mockPost = {
      _id: mockPostId,
      title: 'Post1',
      description: 'Some decscsiorion',
      map: mockMapId,
      owner: new mongoose.Types.ObjectId(),
      comments: [],
      likes: [new mongoose.Types.ObjectId()],
      save: jest.fn().mockReturnThis(),
    };
    jest.spyOn(postModel, 'findById').mockImplementation((id: any) => {
      return mockPost as any;
    });
    const response = await supertest(app)
      .patch(`/posts/post/likeChange`)
      .send({
        postId: mockPostId,
        likeChange: LikeChange.ADD_LIKE,
      })
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('likes', 2);
  });

  it('removing user like', async () => {
    const mockPost = {
      _id: mockPostId,
      title: 'Post1',
      description: 'Some decscsiorion',
      map: mockMapId,
      owner: new mongoose.Types.ObjectId(),
      comments: [],
      likes: [new mongoose.Types.ObjectId(), mockUserID],
      save: jest.fn().mockReturnThis(),
    };
    jest.spyOn(postModel, 'findById').mockImplementation((id: any) => {
      return mockPost as any;
    });
    const response = await supertest(app)
      .patch(`/posts/post/likeChange`)
      .send({
        postId: mockPostId,
        likeChange: LikeChange.REMOVE_LIKE,
      })
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('likes', 1);
  });
});

describe('PATCH /posts/comments/likeChange', () => {
  const mockCommentId = new mongoose.Types.ObjectId();

  it('adding user like', async () => {
    const mockComment = {
      _id: mockCommentId,
      user: mockUserID,
      content: 'some text bruh',
      replies: [],
      likes: [new mongoose.Types.ObjectId()],
      save: jest.fn().mockReturnThis(),
    };
    jest.spyOn(commentModel, 'findById').mockImplementation((id: any) => {
      return mockComment as any;
    });
    const response = await supertest(app)
      .patch(`/posts/comments/likeChange`)
      .send({
        commentId: mockCommentId,
        likeChange: LikeChange.ADD_LIKE,
      })
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('likes', 2);
  });

  it('removing user like', async () => {
    const mockComment = {
      _id: mockCommentId,
      user: mockUserID,
      content: 'some text bruh',
      replies: [],
      likes: [new mongoose.Types.ObjectId(), mockUserID],
      save: jest.fn().mockReturnThis(),
    };

    jest.spyOn(commentModel, 'findById').mockImplementation((id: any) => {
      return mockComment as any;
    });
    const response = await supertest(app)
      .patch(`/posts/comments/likeChange`)
      .send({
        commentId: mockCommentId,
        likeChange: LikeChange.REMOVE_LIKE,
      })
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('likes', 1);
  });
});

describe('POST /posts/comments/:commentId/replies', () => {
  it('add a reply to a comment', async () => {
    jest.spyOn(commentModel.prototype, 'save').mockImplementation(function (
      this: any,
    ) {
      console.log('post saving hte post', this);
      return Promise.resolve(this);
    });
    const mockCommentId = new mongoose.Types.ObjectId();
    const mockComment = {
      _id: mockCommentId,
      user: mockUserID,
      content: 'some comment stuff',
      replies: [],
      likes: [],
      save: jest.fn().mockReturnThis(),
    };
    const mockUser = {
      _id: new mongoose.Types.ObjectId(),
      username: 'someUser',
      profilePic: Buffer.alloc(0),
    };
    jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);

    jest.spyOn(commentModel, 'findById').mockImplementation((id: any) => {
      return mockComment as any;
    });

    const response = await supertest(app)
      .post(`/posts/comments/${mockCommentId}/replies`)
      .send({
        content: 'THIS NEW REPLY',
      })
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('reply');
    expect(response.body.reply.content).toEqual('THIS NEW REPLY');
    expect(response.body.reply.user).toStrictEqual({
      username: 'someUser',
      id: mockUser._id.toString(),
      profilePic: '',
    });
    expect(response.body.reply.likes).toEqual([]);
  });
});

describe('POST /posts/fork/:postId', () => {
  it('forks off a post', async () => {
    const mockPostId = new mongoose.Types.ObjectId();
    const mockMap = {
      ...mapData,
    };

    jest.spyOn(postModel, 'findById').mockResolvedValue({
      _id: new mongoose.Types.ObjectId(mockPostId),
      map: mockMap._id,
    } as any);

    jest.spyOn(mapModel, 'findById').mockResolvedValue(mapData as any);

    jest
      .spyOn(fs.promises, 'readFile')
      .mockResolvedValue(JSON.stringify(geoJSONTemp));

    jest.spyOn(fs.promises, 'writeFile').mockResolvedValue();

    const response = await supertest(app)
      .post(`/posts/fork/${mockPostId}`)
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('forkedMap');
    expect(fs.promises.readFile).toHaveBeenCalled();
    expect(fs.promises.writeFile).toHaveBeenCalled();
    expect(response.body.forkedMap.owner).toEqual(mockUserID.toString());
  });
});

describe('DELETE /posts/comments/:commentId', () => {
  it('deletes a comment', async () => {
    const mockCommentId = new mongoose.Types.ObjectId();

    jest
      .spyOn(commentModel, 'findById')
      .mockImplementation((postId: mongoose.Types.ObjectId | string) => {
        const execMock = jest.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId(postId),
          user: {
            username: 'someguy',
            _id: mockUserID,
            profilePic: Buffer.alloc(0),
          },
          content: 'THE BEST TCONTETN',
          replies: [
            {
              user: {
                username: 'someguy',
                _id: mockUserID,
                profilePic: Buffer.alloc(0),
              },
              content: 'SOME TEXT MESSAGE',
            },
          ], // Assuming comments are already populated
          populate: jest.fn().mockReturnThis(), // Chainable populate method
          exec: jest.fn().mockResolvedValue({}),
          save: jest.fn().mockReturnThis(),
        });

        return { populate: jest.fn().mockReturnThis(), exec: execMock } as any;
      });

    const response = await supertest(app)
      .delete(`/posts/comments/${mockCommentId}`)
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('deletedComment');
    expect(response.body.deletedComment.content).toEqual(
      'Comment has been deleted',
    );
  });
  it('not your comment to delete', async () => {
    const mockCommentId = new mongoose.Types.ObjectId();

    jest
      .spyOn(commentModel, 'findById')
      .mockImplementation((postId: mongoose.Types.ObjectId | string) => {
        const execMock = jest.fn().mockResolvedValue({
          _id: new mongoose.Types.ObjectId(postId),
          user: {
            username: 'someguy',
            _id: new mongoose.Types.ObjectId(),
            profilePic: Buffer.alloc(0),
          },
          content: 'THE BEST TCONTETN',
          replies: [
            {
              user: {
                username: 'someguy',
                _id: mockUserID,
                profilePic: Buffer.alloc(0),
              },
              content: 'SOME TEXT MESSAGE',
            },
          ], // Assuming comments are already populated
          populate: jest.fn().mockReturnThis(), // Chainable populate method
          exec: jest.fn().mockResolvedValue({}),
          save: jest.fn().mockReturnThis(),
        });

        return { populate: jest.fn().mockReturnThis(), exec: execMock } as any;
      });

    const response = await supertest(app)
      .delete(`/posts/comments/${mockCommentId}`)
      .set('Cookie', [`token=${auth.signToken(mockUserID.toString())}`]);

    expect(response.statusCode).toBe(401);
    expect(response.body).toHaveProperty('success', false);
    expect(response.body.message).toEqual('User does not own the comment');
  });
});
