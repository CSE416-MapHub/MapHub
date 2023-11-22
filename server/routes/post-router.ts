import express from 'express';
import auth from '../auth/index';
import PostController from '../controllers/post-controller';
const router = express.Router();

// Handles publishing a map post
router.post('/publish/', auth.verify, PostController.createPost);
// Handles updating an existing post request
router.put('/post/:id', auth.verify, PostController.updatePostById);

// Handles a delete a post request
router.delete('/post/:id', auth.verify, PostController.deletePostById);

// Handles a get a post request
router.get('/post/:id', auth.verify, PostController.getPostById);

//Handles a get posts request
router.get('/all', auth.verify, PostController.queryPosts);

//Handles a create a comment request
router.post('/comments/:postId', auth.verify, PostController.createComment);

//Handles a get a comment request
router.get('/comments/:commentId/', auth.verify, PostController.getCommentById);

//Handles an update comment request
router.put(
  '/comments/:commentId',
  auth.verify,
  PostController.updateCommentById,
);

//Handles a delete comment request
router.delete(
  '/comments/:commentId',
  auth.verify,
  PostController.deleteCommentById,
);

//Handles a get all comments request
router.get(
  '/comments/post/:postId',
  auth.verify,
  PostController.getCommentsByPost,
);

//Handles an add like request
router.post(
  '/comments/:commentId/likes',
  auth.verify,
  PostController.addLikeById,
);

//Handles a remove like request
router.delete(
  '/comments/:commentId/likes/',
  auth.verify,
  PostController.deleteLikeById,
);

//Handles an add reply request
router.post(
  '/comments/:commentId/replies',
  auth.verify,
  PostController.addReplyById,
);

//Handles a get replies request
router.get(
  '/comments/:commentId/replies',
  auth.verify,
  PostController.getAllReplies,
);

export default router;
