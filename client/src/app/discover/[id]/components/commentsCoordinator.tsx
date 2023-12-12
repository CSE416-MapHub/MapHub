'use client';

import { useContext, useState } from 'react';

import CommentsList from './commentsList';
import CommentsDivider from './commentsDivider';
import CommentsFoot from './commentsFoot';
import CommentsField from './commentsField';

import { AuthContext } from 'context/AuthProvider';

function CommentsCoordinator({ post }: any) {
  const [comments, setComments] = useState(post.comments);
  const authContext = useContext(AuthContext);

  const pushComment = (comment: any) => {
    setComments([...comments, comment]);
  };

  return (
    <>
      <CommentsList comments={comments} />
      <CommentsDivider />
      <CommentsFoot likes={post.likes} postId={post.postID} />
      {authContext.state.isLoggedIn && <CommentsField pushComment={pushComment} postId={post.postID} />}
    </>
  );
}

export default CommentsCoordinator;
