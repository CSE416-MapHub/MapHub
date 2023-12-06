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
        <Typography variant="labelLarge">{user.username}</Typography>
      </div>
      <div className={styles['comments-head__texts']}>
        <Typography variant="bodyMedium">{title}</Typography>
        <Typography variant="bodyMedium">{description}</Typography>
      </div>
    </div>
  );
}

export default CommentsHead;
