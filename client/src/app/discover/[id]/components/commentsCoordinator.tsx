'use client';

import { useState } from 'react';

import CommentsList from './commentsList';
import CommentsDivider from './commentsDivider';
import CommentsFoot from './commentsFoot';
import CommentsField from './commentsField';

function CommentsCoordinator({ post }: any) {
  const [comments, setComments] = useState(post.comments);
  const [replyComment, setReplyComment] = useState<
    | {
        username: string;
        content: string;
        id: string;
      }
    | undefined
  >(undefined);

  const pushComment = (comment: any) => {
    setComments([...comments, comment]);
  };

  return (
    <>
      <CommentsList comments={comments} onStartReply={setReplyComment} />
      <CommentsDivider />
      <CommentsFoot likes={post.likes} postId={post.postID} />
      <CommentsField
        pushComment={pushComment}
        postId={post.postID}
        reply={replyComment}
        onCloseReply={() => setReplyComment(undefined)}
      />
    </>
  );
}

export default CommentsCoordinator;
