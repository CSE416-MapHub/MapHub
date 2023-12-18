'use client';

import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Typography } from '@mui/material';
import clsx from 'clsx';

import { AuthContext } from 'context/AuthProvider';
import {
  NotificationsActionType,
  NotificationsContext,
} from 'context/notificationsProvider';
import IconButton from 'components/iconButton';

import styles from '../styles/commentsFoot.module.scss';
import PostAPI from '../../../../api/PostAPI';
import { LikeChange } from '../../../../types/postPayload';

interface CommentsFootProps {
  likes: string[];
  postId: string;
}

function CommentsFoot({ likes, postId }: CommentsFootProps) {
  const auth = useContext(AuthContext);
  const notifications = useContext(NotificationsContext);
  const router = useRouter();

  const [isLiked, setIsLiked] = useState(
    auth.state.user ? likes.includes(auth.state?.user.id) : false,
  );
  const [numLikes, setNumLikes] = useState(likes.length);

  useEffect(() => {
    setIsLiked(auth.state.user ? likes.includes(auth.state?.user.id) : false);
  }, [auth.state.user?.id]);

  const handleLikeClick = async () => {
    if (auth.state.isLoggedIn === false) {
      notifications.dispatch({
        type: NotificationsActionType.enqueue,
        value: {
          message: 'Please sign up to like the map.',
          actions: {
            label: {
              text: 'Sign Up',
              onClick: () => router.push('/account/create'),
            },
          },
        },
      });
    } else {
      setIsLiked(!isLiked);
      try {
        const response = await PostAPI.changeLikeToPost(
          postId,
          isLiked ? LikeChange.REMOVE_LIKE : LikeChange.ADD_LIKE,
        );
        setNumLikes(response.data.likes);
      } catch { }
    }
  };

  const handleCopyClick = async () => {
    if (auth.state.isLoggedIn === false) {
      notifications.dispatch({
        type: NotificationsActionType.enqueue,
        value: {
          message: 'Please sign up to copy the map.',
          actions: {
            label: {
              text: 'Sign Up',
              onClick: () => router.push('/account/create'),
            },
          },
        },
      });
    } else {
      try {
        const response = await PostAPI.forkMap(postId);
        const forkedMap = response.data.forkedMap;
        const route = '/create?mapid=' + forkedMap._id;
        router.push(route);
      } catch { }
    }
  }

  return (
    <div className={styles['comments__foot']}>
      <div className={styles['comments__icons']}>
        <IconButton
          className={clsx({
            [styles['comments__icon--liked']]: isLiked,
          })}
          iconName="heart"
          iconType={isLiked ? 'solid' : 'regular'}
          onClick={handleLikeClick}
        />
        <IconButton
          iconName="copy"
          iconType="regular"
          onClick={handleCopyClick}
        />
      </div>
      <Typography
        className={styles['comments__text--like-count']}
        variant="bodyLarge"
      >{`${numLikes} like${numLikes !== 1 ? 's' : ''}`}</Typography>
    </div>
  );
}

export default CommentsFoot;
