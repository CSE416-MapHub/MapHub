import CommentsListItem from './commentsListItem';

import styles from '../styles/commentsList.module.scss';

interface CommentsListProps {
  comments: {
    _id: string;
    user: {
      _id: string;
      username: string;
      profilePic: Buffer;
    };
    content: string;
    replies: [];
    likes: [];
    createdAt: string;
    updatedAt: string;
    __v: number;
  }[];
}
function CommentsList({ comments }: CommentsListProps) {
  return (
    <ul className={styles['comments__list']}>
      {comments.map(comment => (
        <CommentsListItem
          user={{
            username: comment.user.username,
            profilePic: comment.user.profilePic,
          }}
          content={comment.content}
          key={comment._id}
        />
      ))}
    </ul>
  );
}

export default CommentsList;
