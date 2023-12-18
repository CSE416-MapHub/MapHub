import { Typography } from '@mui/material';

import Avatar from 'components/avatar';

import styles from '../styles/commentsHead.module.scss';

interface CommentsHeadProps {
  user: {
    username: string;
    profilePic: string;
  };
  title: string;
  description: string;
}

function CommentsHead({ user, title, description }: CommentsHeadProps) {
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
      </div>
    </div>
  );
}

export default CommentsHead;
