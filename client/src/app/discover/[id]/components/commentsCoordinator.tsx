'use client';

import { useState } from 'react';

import CommentsList from './commentsList';
import CommentsDivider from './commentsDivider';
import CommentsFoot from './commentsFoot';
import CommentsField from './commentsField';

interface Comment {
  id: string;
  user: {
    id: string;
    username: string;
    profilePic: string;
  };
  content: string;
  replies: Reply[];
  likes: string[];
  createdAt: string;
}

type Reply = Omit<Comment, 'replies'>;

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

  const pushReply = (commentId: string, reply: Reply) => {
    const comment = comments.find(
      (comment: Comment) => commentId === comment.id,
    );
    if (comment) {
      comment.replies = [...comment.replies, reply];
      setComments([...comments, comment]);
    }
  };

  return (
    <>
      <CommentsList comments={comments} onStartReply={setReplyComment} />
      <CommentsDivider />
      <CommentsFoot likes={post.likes} postId={post.postID} />
      <CommentsField
        pushComment={pushComment}
        pushReply={pushReply}
        postId={post.postID}
        reply={replyComment}
        setReply={setReplyComment}
      />
    </>
  );
}

export default CommentsCoordinator;
