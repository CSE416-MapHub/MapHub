import supertest from 'supertest';
import app from '../app';
import postModel from '../models/post-model';
import mongoose from 'mongoose';
import auth from '../auth/index';

const userId = new mongoose.Types.ObjectId();

beforeEach(() => {
  jest.setTimeout(6000);
});

jest.mock('../models/post-model');

describe('POST /posts/publish', () => {
  it('publishing a map into a post', async () => {
    const mockId = new mongoose.Types.ObjectId();
    const mapId = new mongoose.Types.ObjectId();
    const savedPost = {
      _id: mockId,
      title: 'Ukranian War',
      description: 'very sad times',
      mapID: mapId,
      owner: userId,
      comments: [],
      likes: [],
    };

    postModel.prototype.save = jest.fn().mockResolvedValue(savedPost);

    const response = await supertest(app)
      .post(`/posts/publish/`)
      .send({
        mapID: savedPost.mapID,
        title: savedPost.title,
        description: savedPost.description,
      })
      .set('Cookie', [`token=${auth.signToken(userId.toString())}`]);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('post');
    expect(response.body.post).toEqual({ postId: mockId.toString() });
  });
});
