import CommentsListItem from './commentsListItem';
import RepliesListItem from './repliesListItem';

import styles from '../styles/commentsList.module.scss';

interface CommentsListProps {
  comments: {
    id: string;
    user: {
      id: string;
      username: string;
      profilePic: string;
    };
    content: string;
    replies: [];
    likes: [];
    createdAt: string;
  }[];
  onStartReply: Function;
}
function CommentsList({ comments, onStartReply }: CommentsListProps) {
  return (
    <ul className={styles['comments__list']}>
      {comments.map(comment => (
        <>
          <CommentsListItem
            user={{
              username: comment.user.username,
              profilePic: comment.user.profilePic,
            }}
            content={comment.content}
            key={comment.id}
            id={comment.id}
            time={comment.createdAt}
            onStartReply={onStartReply}
          />
          {comment.replies.length > 0 ? (
            <RepliesListItem replies={comment.replies} />
          ) : (
            ''
          )}
        </>
      ))}
    </ul>
  );
}

export default CommentsList;
