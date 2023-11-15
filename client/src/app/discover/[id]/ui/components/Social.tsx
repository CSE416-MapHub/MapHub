'use client';
import { useParams } from 'next/navigation';
import AuthorData from './AuthorData';
import { Divider, IconButton, TextField, Typography } from '@mui/material';
import style from './social.module.scss';
import Comment, { CommentsProps } from './Comment';
import { useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

export default function () {
  const params: { id: string } = useParams();
  // this is the id of the comment you're replying to
  const [replyingTo, setReplyingTo] = useState<{
    username: string;
    id: string;
  }>({
    username: '',
    id: '',
  });

  // magically get comments
  const comments: Array<CommentsProps> = [
    {
      name: 'Shelby',
      pfp: Buffer.from(''),
      content: 'Wow! I really like this!',
      isTop: true,
      onReply: () => setReplyingTo({ username: 'Shelby', id: '1' }),
    },
    {
      name: 'Michael',
      pfp: Buffer.from(''),
      content: ' a reply to shelby',
      isTop: false,
      onReply: () => setReplyingTo({ username: 'Michael', id: '2' }),
    },
    {
      name: 'Michael',
      pfp: Buffer.from(''),
      content: ' anotehr reply to shelby',
      isTop: false,
      onReply: () => setReplyingTo({ username: 'Michael', id: '2' }),
    },
    {
      name: 'Trol',
      pfp: Buffer.from(''),
      content: 'trololol',
      isTop: true,
      onReply: () => setReplyingTo({ username: 'Trol', id: '3' }),
    },
    {
      name: 'Shelby',
      pfp: Buffer.from(''),
      content: 'Wow! I really like this!',
      isTop: true,
      onReply: () => setReplyingTo({ username: 'Shelby', id: '1' }),
    },
    {
      name: 'Michael',
      pfp: Buffer.from(''),
      content: ' a reply to shelby',
      isTop: false,
      onReply: () => setReplyingTo({ username: 'Michael', id: '2' }),
    },
    {
      name: 'Michael',
      pfp: Buffer.from(''),
      content: ' anotehr reply to shelby',
      isTop: false,
      onReply: () => setReplyingTo({ username: 'Michael', id: '2' }),
    },
    {
      name: 'Trol',
      pfp: Buffer.from(''),
      content: 'trololol',
      isTop: true,
      onReply: () => setReplyingTo({ username: 'Trol', id: '3' }),
    },
    {
      name: 'Shelby',
      pfp: Buffer.from(''),
      content: 'Wow! I really like this!',
      isTop: true,
      onReply: () => setReplyingTo({ username: 'Shelby', id: '1' }),
    },
    {
      name: 'Michael',
      pfp: Buffer.from(''),
      content: ' a reply to shelby',
      isTop: false,
      onReply: () => setReplyingTo({ username: 'Michael', id: '2' }),
    },
    {
      name: 'Michael',
      pfp: Buffer.from(''),
      content: ' anotehr reply to shelby',
      isTop: false,
      onReply: () => setReplyingTo({ username: 'Michael', id: '2' }),
    },
    {
      name: 'Trol',
      pfp: Buffer.from(''),
      content: 'trololol',
      isTop: true,
      onReply: () => setReplyingTo({ username: 'Trol', id: '3' }),
    },
  ];

  let replyHint = (
    <>
      <Divider />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '6px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            marginLeft: '12%',
          }}
        >
          <Typography variant="button">
            Replying to {replyingTo.username}
          </Typography>
        </div>

        <IconButton
          id="cancelReply"
          onClick={() =>
            setReplyingTo({
              username: '',
              id: '',
            })
          }
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </div>
    </>
  );

  if (replyingTo.username === '') {
    replyHint = <></>;
  }

  return (
    <div className={style['social']}>
      <AuthorData />
      <div
        style={{
          overflow: 'auto',
        }}
      >
        {comments.map((c, i) => (
          <Comment {...c} key={i}></Comment>
        ))}
      </div>
      {replyHint}
      <div
        style={{
          padding: '8px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',

            // display: 'grid',
            // gridTemplateColumns: '1fr 1fr 1fr',
          }}
        >
          <IconButton>
            <ContentCopyIcon />
          </IconButton>
          <TextField
            label="Comment"
            variant="outlined"
            sx={{
              width: '100%',
            }}
          />
          <IconButton>
            <SendIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
