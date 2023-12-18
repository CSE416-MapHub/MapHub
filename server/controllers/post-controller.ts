import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Post from '../models/post-model';
import Comment from '../models/comment-model';
import Map from '../models/map-model';
import User from '../models/user-model';
import fs from 'fs';
import { convertJsonToSVG, SVGDetail } from './map-controller';
import { PopulatedComment } from '../models/comment-model';
import { UserType } from '../models/user-model';

type MapDocument = typeof Map.prototype;

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
      console.log('in get user posts');
      const userId = req.params.userId;
      console.log(userId);

      console.log('before finding posts');

      const posts = await Post.find({ owner: userId }).exec();

      console.log('after finding posts');
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
            const svg = map
              ? await convertJsonToSVG(map, SVGDetail.THUMBNAIL)
              : null;

            return {
              title: post.title,
              description: post.description,
              postID: post._id,
              mapID: post.map,
              numLikes: post.likes.length,
              svg: svg,
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
      console.log('GETTING POST WITH ID', postId);

      const post = await Post.findById(postId)
        .populate<{ comments: PopulatedComment[] }>({
          path: 'comments', // Path to the field in the Post model
          model: 'Comment', // Model to use for population
          populate: [
            {
              path: 'user', // Path to the user (owner) field in the Comment model
              model: 'User', // Model to use for population of the comment's owner
              select: 'username _id profilePic', // Only select specific fields for the comment's owner
            },
            {
              path: 'replies', // Path to the field in the Comment model
              model: 'Comment', // Model to use for population of replies
              populate: {
                path: 'user', // Path to the user field in the Comment model
                model: 'User', // Model to use for population of user
                select: 'username _id profilePic', // Only select specific fields
              },
            },
          ],
        })
        .populate<{ owner: UserType }>({
          path: 'owner', // Path to the user field in the Post model
          model: 'User', // Model to use for population of the post's user
          select: 'username _id profilePic', // Only select specific fields for the user of the post
        })
        .exec();

      if (!post) {
        return res
          .status(404)
          .json({ success: false, message: 'Post not found' });
      }

      console.log(
        'Got post',
        JSON.stringify({
          title: post.title,
          description: post.description,
          owner: post.owner,
        }),
        'with id',
        postId,
      );

      const map = await Map.findById(post.map).exec();
      if (!map) {
        return res.status(500).json({
          success: false,
          message: 'Database never had a map with correct ID reference',
        });
      }

      const svg = map ? await convertJsonToSVG(map, SVGDetail.DETAILED) : null;

      const comments = post.comments.map(comment => {
        return {
          likes: comment.likes,
          content: comment.content,
          replies: comment.replies.map(reply => {
            return {
              likes: reply.likes,
              content: reply.content,
              user: {
                id: reply.user._id,
                username: reply.user.username,
                profilePic: Buffer.from(reply.user.profilePic).toString(
                  'base64',
                ),
              },
              createdAt: reply.createdAt,
            };
          }),
          user: {
            id: comment.user._id,
            username: comment.user.username,
            profilePic: Buffer.from(comment.user.profilePic).toString('base64'),
          },
          createdAt: comment.createdAt,
        };
      });

      const userProfilePic = Buffer.from(post.owner.profilePic).toString(
        'base64',
      );

      const postFound = {
        title: post.title,
        description: post.description,
        owner: {
          id: post.owner._id,
          username: post.owner.username,
          profilePic: userProfilePic,
        },
        postID: post._id,
        mapID: post.map,
        svg: svg,
        likes: post.likes,
        comments: comments,
        createdAt: post.createdAt,
      };

      return res.status(200).json({
        success: true,
        post: postFound,
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

            console.log('MAP', map);

            const svg = map
              ? await convertJsonToSVG(map, SVGDetail.THUMBNAIL)
              : null;

            return {
              title: post.title,
              description: post.description,
              userId: post.owner,
              postId: post._id,
              mapID: post.map,
              svg: svg,
              numLikes: post.likes.length,
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
      const userCommented = await User.findById(userId);
      await post.save();

      res.status(200).json({
        success: true,
        comment: savedComment,
        user: {
          _id: userCommented?._id,
          username: userCommented?.username,
          profilePic: userCommented?.profilePic
            ? Buffer.from(userCommented.profilePic).toString('base64')
            : '',
        },
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
        if (!post.likes.includes(userId)) {
          post.likes.push(userId);
        }
      } else if (likeChange === LikeChange.REMOVE_LIKE) {
        console.log('removed like');
        post.likes = post.likes.filter(
          like => like.toString() !== userId.toString(),
        );
      }
      console.log(JSON.stringify(post));
      await post.save();

      //returns the new likes amount
      return res.status(200).json({
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

  deleteCommentById: async (req: Request, res: Response) => {
    const commentId = req.params.commentId;
    const userId = (req as any).userId;

    try {
      const commentToBeDeleted = await Comment.findById(commentId)
        .populate({
          path: 'user',
          model: 'User',
          select: 'username _id profilePic',
        })
        .populate({
          path: 'replies',
          model: 'Comment',
          populate: {
            path: 'user',
            model: 'User',
            select: 'username _id profilePic',
          },
        })
        .exec();
      if (!commentToBeDeleted) {
        return res
          .status(404)
          .json({ success: false, message: 'Comment not found' });
      }

      console.log(
        'USER WHO CALLED',
        userId,
        'COMMENT OWNER',
        commentToBeDeleted.user._id,
      );
      if (commentToBeDeleted.user._id.toString() === userId.toString()) {
        commentToBeDeleted.content = 'Comment has been deleted';

        const savedComment = await commentToBeDeleted.save();
        return res.status(200).json({
          success: true,
          deletedComment: savedComment,
        });
      } else {
        return res
          .status(401)
          .json({ success: false, message: 'User does not own the comment' });
      }
    } catch (err: any) {
      console.error('ERROR INside of delete comment', err.message);
      return res.status(400).json({ success: false, message: err });
    }
  },

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

  forkMap: async (req: Request, res: Response) => {
    const userId = (req as any).userId;
    const postId = req.params.postId;
    console.log('ENTERING FORK');
    try {
      const post = await Post.findById(postId);

      if (!post) {
        return res
          .status(400)
          .json({ success: false, message: 'Post not found' });
      }

      console.log('Post in qu', post);
      const mapPost = await Map.findById(post.map);

      if (!mapPost || mapPost === undefined || !mapPost.geoJSON) {
        return res
          .status(500)
          .json({ success: false, message: 'Map in Post not found' });
      }

      console.log('POST MAP ORIGINAL', JSON.stringify(mapPost));

      const forkedMap = new Map({
        ...post.map,
        owner: userId,
        _id: new mongoose.Types.ObjectId(), // Generate a new ID
        createdAt: Date.now(), // Reset creation date
        updatedAt: Date.now(), // Reset update date
      });

      console.log('POST MAP FORKED', JSON.stringify(forkedMap));

      const user = await User.findById(userId);
      if (!user) {
        return res.status(400).json({
          success: false,
          message:
            'User not found, WHICH SHOULDNT HAPPEN CAUSE WE ALREAYD VALIDATED',
        });
      }

      const objectIdRegex = /[a-z0-9]+(?=\.geojson)/;

      const newFilePath = mapPost.geoJSON.replace(
        objectIdRegex,
        forkedMap._id.toString(),
      );

      console.log(
        'new file path',
        newFilePath,
        'old file path',
        mapPost.geoJSON,
      );

      const data = await fs.promises.readFile(mapPost.geoJSON, 'utf8');

      // Write to the new file
      await fs.promises.writeFile(newFilePath, data, 'utf8');

      console.log('Map duplicated successfully in directory');

      forkedMap.geoJSON = newFilePath;

      user.maps.push(forkedMap._id);

      await user.save();
      await forkedMap.save();

      res.status(200).json({
        success: true,
        forkedMap: forkedMap,
      });
    } catch (err: any) {
      console.error('Error in forking:', err.message);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  },
};

export default PostController;
