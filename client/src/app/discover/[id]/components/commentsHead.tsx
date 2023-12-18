import { Typography } from '@mui/material';

import Avatar from 'components/avatar';
import TimeDelta from 'utils/timeDelta';

import styles from '../styles/commentsHead.module.scss';

interface CommentsHeadProps {
  user: {
    username: string;
    profilePic: string;
  };
  title: string;
  description: string;
  time: string;
}

function CommentsHead({ user, title, description, time }: CommentsHeadProps) {
  return (
    <div className={styles['comments__head']}>
      <Avatar
        src={
          user.profilePic
            ? `data:image/webp;base64,${user.profilePic}`
            : undefined
        }
      />
      <div>
        <Typography variant="bodyLarge">{user.username}</Typography>
        <Typography variant="bodyMedium">{title}</Typography>
        <Typography variant="bodyMedium">{description}</Typography>
        <div className={styles['comments__meta']}>
          <Typography variant="bodySmall">
            {TimeDelta.getTimeDeltaString(time)}
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default CommentsHead;
