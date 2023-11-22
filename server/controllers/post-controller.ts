import { Request, Response } from 'express';
import auth from '../auth/index';
import mongoose from 'mongoose';
import Post from '../models/post-model';
import Map from '../models/map-model';
import express from 'express';
import fs from 'fs';
import path from 'path';

const PostController = {
  createPost: async (req: Request, res: Response) => {
    const { mapId, title, description } = req.body;
    const userId = (req as any).userId;
    console.log(
      'Starting the publish of',
      title,
      'with Desription of:',
      description,
      'to user with id of',
      userId,
    );
    let savedPost;
    let newPost;
    try {
      newPost = new Post({
        title: title,
        description: description,
        map: mapId,
        owner: userId,
        comments: [],
        likes: [],
      });
      savedPost = await newPost.save();
      res.status(200).json({
        success: true,
        post: { postId: savedPost._id },
      });
    } catch (err: any) {
      console.error(err.message);
      return res
        .status(500)
        .json({ error: `post saving error: ${err.message}` });
    }
  },
  updatePostById: async (req: Request, res: Response) => {},
  deletePostById: async (req: Request, res: Response) => {},
  getPostById: async (req: Request, res: Response) => {},
  queryPosts: async (req: Request, res: Response) => {},
  createComment: async (req: Request, res: Response) => {},
  getCommentById: async (req: Request, res: Response) => {},
  updateCommentById: async (req: Request, res: Response) => {},
  deleteCommentById: async (req: Request, res: Response) => {},
  getCommentsByPost: async (req: Request, res: Response) => {},
  addLikeById: async (req: Request, res: Response) => {},
  deleteLikeById: async (req: Request, res: Response) => {},
  addReplyById: async (req: Request, res: Response) => {},
  getAllReplies: async (req: Request, res: Response) => {},
};

export default PostController;
