import { Request, Response } from 'express';
import auth from '../auth/index';
import mongoose from 'mongoose';
import Post from '../models/post-model';
import Comment from '../models/comment-model';
import Map from '../models/map-model';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { convertJsonToPng } from './map-controller';

export enum LikeChange {
  ADD_LIKE = 'like',
  REMOVE_LIKE = 'dislike',
}
const PostController = {
  createPost: async (req: Request, res: Response) => {
    const { mapID, title, description } = req.body;
    const userId = (req as any).userId;

    console.log(
      'Starting the publish of',
      title,
      'with Desription of:',
      description,
      'to user with id of',
      userId,
      'of id ',
      mapID,
    );
    let savedPost;
    let newPost;

    const map = await Map.findById(mapID).exec();

    if (!map) {
      return res.status(404).json({ success: false, message: 'Map not found' });
    }

    try {
      newPost = new Post({
        title: title,
        description: description,
        map: mapID,
        owner: userId,
        comments: [],
        likes: [],
      });

      map.title = title;
      map.published = true;

      savedPost = await newPost.save();
      console.log(savedPost);
      await map.save();

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
  getUserPosts: async (req: Request, res: Response) => {
    try {
      // const userId = (req as any).userId;
      console.log(req.query.id);


      const posts = await Post.find({ owner: req.params.userId }).exec();

      console.log(
        'Getting posts by user',
        req.params.userId,
        JSON.stringify(posts),
        posts.length,
      );
      if (posts && posts.length > 0) {
        const transformedPosts = await Promise.all(
          posts.map(async post => {
            console.log('STARTING POST BY POST', JSON.stringify(post));
            const map = await Map.findById(post.map).exec();
            console.log(JSON.stringify(map));
            const png = map ? await convertJsonToPng(map) : null;

            return {
              title: post.title,
              description: post.description,
              postID: post._id,
              mapID: post.map,
              png: png,
            };
          }),
        );

        res.status(200).json({
          success: true,
          posts: transformedPosts,
        });
      } else {
        res.status(200).json({
          success: true,
          posts: [],
        });
      }
    } catch (error) {
      console.error('Error in queryPosts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  },
  updatePostById: async (req: Request, res: Response) => {
    const postPayload = req.body.postPayload;
  },
  deletePostById: async (req: Request, res: Response) => {},
  getPostById: async (req: Request, res: Response) => {
    try {
      const postId = req.params.postId;
      const post = await Post.findById(postId)
        .populate({
          path: 'comments', // Path to the field in the Post model
          model: 'Comment', // Model to use for population
          populate: {
            path: 'replies', // Path to the field in the Comment model
            model: 'Comment', // Model to use for population of replies
          },
        })
        .exec();

      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: 'Post not found' });
      }

      console.log('Got post', JSON.stringify(post), 'with id', postId);

      const map = await Map.findById(post.map).exec();
      if (!map) {
        return res.status(500).json({
          success: false,
          message: 'Database never had a map with correct ID reference',
        });
      }

      const png = map ? await convertJsonToPng(map) : null;

      const postFound = {
        title: post.title,
        description: post.description,
        postID: post._id,
        mapID: post.map,
        png: png,
        likes: post.likes,
        comments: post.comments,
      };

      res.status(200).json({
        success: true,
        posts: postFound,
      });
    } catch (error) {
      console.error('Error in queryPosts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  },
  queryPosts: async (req: Request, res: Response) => {
    try {
      const searchQuery = req.query.searchQuery || '';

      let queryCondition = {};
      if (searchQuery) {
        queryCondition = {
          title: { $regex: searchQuery, $options: 'i' },
        };
      }

      const posts = await Post.find(queryCondition).exec();

      console.log(
        'These are the posts by the search',
        JSON.stringify(posts),
        posts.length,
      );
      if (posts && posts.length > 0) {
        const transformedPosts = await Promise.all(
          posts.map(async post => {
            console.log('STARTING POST BY POST', JSON.stringify(post));

            const map = await Map.findById(post.map).exec();

            console.log(JSON.stringify(map));
            const png = map ? await convertJsonToPng(map) : null;

            return {
              title: post.title,
              description: post.description,
              postID: post._id,
              mapID: post.map,
              png: png,
            };
          }),
        );

        res.status(200).json({
          success: true,
          posts: transformedPosts,
        });
      } else {
        res.status(200).json({
          success: true,
          posts: [],
        });
      }
    } catch (error) {
      console.error('Error in queryPosts:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  },
  createComment: async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { content } = req.body;
    const postId = req.params.postId;

    const post = await Post.findById(postId);

    if (!post) {
      return res
        .status(404)
        .json({ success: false, message: 'Post not found' });
    }

    const newComment = new Comment({
      user: userId,
      content: content,
      replies: [],
      likes: [],
    });

    try {
      const savedComment = await newComment.save();
      post.comments.push(savedComment._id);

      await post.save();

      res.status(200).json({
        success: true,
        comment: savedComment,
      });
    } catch (err: any) {
      console.error('Error in comment creation:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  },

  changeLikeToPost: async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    console.log(req.body);
    const { postId, likeChange } = req.body;

    if (!postId) {
      return res
        .status(400)
        .json({ success: false, message: 'Like Payload Not provided' });
    }

    try {
      const post = await Post.findById(postId);
      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: 'Post not found' });
      }
      if (likeChange === LikeChange.ADD_LIKE) {
        console.log('added like');
        post.likes.push(userId);
      } else if (likeChange === LikeChange.REMOVE_LIKE) {
        console.log('removed like');
        post.likes = post.likes.filter(
          like => like.toString() !== userId.toString(),
        );
      }
      console.log(JSON.stringify(post));
      await post.save();

      //returns the new likes amount
      res.status(200).json({
        success: true,
        likes: post.likes.length,
      });
    } catch (err: any) {
      console.error('Error in comment creation:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  },

  deleteCommentById: async (req: Request, res: Response) => {},

  likeChangeComment: async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { commentId, likeChange } = req.body;

    if (!commentId) {
      return res
        .status(400)
        .json({ success: false, message: 'Like Payload Not provided' });
    }

    try {
      const comment = await Comment.findById(commentId);
      if (!comment) {
        return res
          .status(404)
          .json({ success: false, message: 'Post not found' });
      }
      if (likeChange === LikeChange.ADD_LIKE) {
        console.log('added like');
        comment.likes.push(userId);
      } else if (likeChange === LikeChange.REMOVE_LIKE) {
        console.log('removed like');
        comment.likes = comment.likes.filter(
          like => like.toString() !== userId.toString(),
        );
      }
      console.log(JSON.stringify(comment));
      await comment.save();

      //returns the new likes amount
      res.status(200).json({
        success: true,
        likes: comment.likes.length,
      });
    } catch (err: any) {
      console.error('Error in comment creation:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  },
  addReplyById: async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const { content } = req.body;
    const commentId = req.params.commentId;

    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res
        .status(400)
        .json({ success: false, message: 'Comment not found' });
    }

    const newReply = new Comment({
      user: userId,
      content: content,
      replies: [],
      likes: [],
    });

    try {
      const savedReply = await newReply.save();
      comment.replies.push(savedReply._id);

      console.log('THIS IS A REPLY', savedReply);
      console.log('THIS IS A COMMENT', comment);

      await comment.save();

      res.status(200).json({
        success: true,
        reply: savedReply,
      });
    } catch (err: any) {
      console.error('Error in comment creation:', err);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  },
  getAllReplies: async (req: Request, res: Response) => {},
};

export default PostController;
