'use client';

import {
  ChangeEventHandler,
  MouseEventHandler,
  useContext,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

import { AuthContext } from 'context/AuthProvider';
import {
  NotificationsActionType,
  NotificationsContext,
} from 'context/notificationsProvider';
import PostAPI from 'api/PostAPI';
import IconButton from 'components/iconButton';
import TextField from 'components/textField';

import styles from '../styles/commentsField.module.scss';

interface CommentsFieldProps {
  postId: string;
  pushComment: Function;
}

function CommentsField({ postId, pushComment }: CommentsFieldProps) {
  const auth = useContext(AuthContext);
  const notifications = useContext(NotificationsContext);
  const router = useRouter();
  const [comment, setComment] = useState('');

  const handleCommentChange: ChangeEventHandler = event => {
    setComment((event.currentTarget as HTMLInputElement).value);
  };

  const handleCommentClick: MouseEventHandler = async () => {
    if (!auth.state.isLoggedIn) {
      notifications.dispatch({
        type: NotificationsActionType.enqueue,
        value: {
          message: "Can't leave comment.",
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
        const response = await PostAPI.createComment(postId, comment);
        response.data.comment.user = {
          username: auth.state.user?.username,
        };
        pushComment({
          ...response.data.comment,
          user: { ...response.data.user },
        });
        setComment('');
      } catch (error) {
        notifications.dispatch({
          type: NotificationsActionType.enqueue,
          value: {
            message: "There is a network error. Can't leave comment.",
            actions: {
              close: true,
            },
          },
        });
      }
    }
  };

  return (
    <div className={styles['comments-field__container']}>
      <TextField
        className={styles['comments-field__input']}
        label="Add a Comment..."
        value={comment}
        onChange={handleCommentChange}
        variant="outlined"
        autoComplete="off"
        multiline={true}
        maxRows={4}
        endAdornment={
          <IconButton
            className={styles['trailing-icon']}
            onClick={handleCommentClick}
            iconName="send"
            iconType="regular"
            disabled={comment.length === 0}
          />
        }
      />
    </div>
  );
}

export default CommentsField;
