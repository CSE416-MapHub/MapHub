import { Typography } from '@mui/material';

import Avatar from 'components/avatar';
import TimeDelta from 'utils/timeDelta';

import styles from '../styles/commentsListItem.module.scss';
import { HTMLAttributes } from 'react';

interface CommentsListItemProps extends HTMLAttributes<HTMLDivElement> {
  user: {
    username: string;
    profilePic: string;
  };
  content: string;
  time: string;
  onStartReply?: Function;
  key: string;
  id: string;
}
function CommentsListItem({
  className,
  user,
  content,
  time,
  onStartReply,
  id,
}: CommentsListItemProps) {
  return (
    <li className={`${styles['comments__list-item']} ${className}`}>
      <Avatar
        src={
          user.profilePic
            ? `data:image/webp;base64,${user.profilePic}`
            : undefined
        }
      />
      <div className={styles['text__container']}>
        <Typography className={styles['comments__label']} variant="bodyLarge">
          {user.username}
        </Typography>
        <Typography
          className={styles['comments__support']}
          variant="bodyMedium"
        >
          {content}
        </Typography>
        <div className={styles['comments__meta']}>
          <Typography variant="bodySmall">
            {TimeDelta.getTimeDeltaString(time)}
          </Typography>

          {onStartReply ? (
            <button
              className={styles['comments__reply']}
              onClick={() =>
                onStartReply({ username: user.username, content, id })
              }
            >
              <Typography variant="bodySmall">Reply</Typography>
            </button>
          ) : (
            ''
          )}
        </div>
      </div>
    </li>
  );
}

export default CommentsListItem;
