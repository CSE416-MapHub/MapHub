'use client';

import { useState } from 'react';

import CommentsList from './commentsList';
import CommentsDivider from './commentsDivider';
import CommentsFoot from './commentsFoot';
import CommentsField from './commentsField';

function CommentsCoordinator({ post }: any) {
  const [comments, setComments] = useState(post.comments);

  const pushComment = (comment: any) => {
    setComments([...comments, comment]);
  };

  return (
    <>
      <CommentsList comments={comments} />
      <CommentsDivider />
      <CommentsFoot likes={post.likes} postId={post.postID} />
      <CommentsField pushComment={pushComment} postId={post.postID} />
    </>
  );
}

export default CommentsCoordinator;
