'use client';

import {
  ChangeEventHandler,
  MouseEventHandler,
  useContext,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { Typography } from '@mui/material';

import { AuthContext } from 'context/AuthProvider';
import {
  NotificationsActionType,
  NotificationsContext,
} from 'context/notificationsProvider';
import PostAPI from 'api/PostAPI';
import IconButton from 'components/iconButton';
import TextField from 'components/textField';
import CommentsDivider from '../components/commentsDivider';

import styles from '../styles/commentsField.module.scss';

interface CommentsFieldProps {
  postId: string;
  pushComment: Function;
  pushReply: Function;
  reply?: {
    id: string;
    username: string;
    content: string;
  };
  setReply: Function;
}

function CommentsField({
  postId,
  pushComment,
  pushReply,
  reply,
  setReply,
}: CommentsFieldProps) {
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
        if (!reply) {
          const response = await PostAPI.createComment(postId, comment);
          pushComment({
            ...response.data.comment,
            user: { ...response.data.user },
          });
          setComment('');
        } else {
          const response = await PostAPI.addReplyToComment(reply.id, comment);
          pushReply(reply.id, response.data.reply);
          setComment('');
          setReply(undefined);
        }
      } catch (error) {
        notifications.dispatch({
          type: NotificationsActionType.enqueue,
          value: {
            message: `There is a network error. Can't leave ${
              reply ? 'reply' : 'comment'
            }.`,
            actions: {
              close: true,
            },
          },
        });
      }
    }
  };

  return (
    <>
      {reply ? (
        <>
          <CommentsDivider />
          <div className={styles['comments-reply__container']}>
            <div>
              <Typography variant="bodyMedium">{`Replying to ${reply.username}`}</Typography>
              <Typography
                className={styles['comments-reply__content']}
                variant="bodySmall"
              >
                {reply.content}
              </Typography>
            </div>
            <div className={styles['close__container']}>
              <IconButton
                iconType="regular"
                iconName="x"
                onClick={() => setReply(undefined)}
              />
            </div>
          </div>
        </>
      ) : (
        ''
      )}

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
          disabled={!auth.state.isLoggedIn}
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
    </>
  );
}

export default CommentsField;
