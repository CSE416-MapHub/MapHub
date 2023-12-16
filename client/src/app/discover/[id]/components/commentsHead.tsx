import { Typography } from '@mui/material';

import Avatar from 'components/avatar';

import styles from '../styles/commentsHead.module.scss';

interface CommentsHeadProps {
  user: {
    username: string;
    profilePic: Buffer;
  };
  title: string;
  description: string;
}

function CommentsHead({ user, title, description }: CommentsHeadProps) {
  return (
    <div className={styles['comments-head__container']}>
      <div className={styles['comments-head__avatar']}>
        <Avatar />
        <Typography variant="title">{user.username}</Typography>
      </div>
      <div className={styles['comments-head__texts']}>
        <Typography variant="bodyLarge">{title}</Typography>
        <Typography variant="bodySmall">{description}</Typography>
      </div>
    </div>
  );
}

export default CommentsHead;
