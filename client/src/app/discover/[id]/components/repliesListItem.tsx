'use client';

import CommentsListItem from './commentsListItem';
import { useState, HTMLAttributes } from 'react';
import { Typography } from '@mui/material';

import styles from '../styles/repliesListItem.module.scss';

interface RepliesListItemProps extends HTMLAttributes<HTMLDivElement> {
  replies: {
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
}
function RepliesListItem({ replies, ...props }: RepliesListItemProps) {
  const [isShown, setShow] = useState(false);

  return (
    <>
      <div className={styles['reply__container']} {...props}>
        <button
          className={styles['reply__show-button']}
          onClick={() => setShow(!isShown)}
        >
          <div className={styles['reply__divider']} />
          <Typography variant="bodySmall">
            {!isShown ? `View Replies (${replies.length})` : 'Hide Replies'}
          </Typography>
        </button>
      </div>
      {isShown
        ? replies.map(reply => (
            <CommentsListItem
              className={styles['reply__item']}
              user={{
                username: reply.user.username,
                profilePic: reply.user.profilePic,
              }}
              content={reply.content}
              time={reply.createdAt}
              key={reply.id}
              id={reply.id}
            />
          ))
        : ''}
    </>
  );
}

export default RepliesListItem;
