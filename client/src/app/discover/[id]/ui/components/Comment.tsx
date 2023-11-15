import { IconButton, Typography } from '@mui/material';
import ReplyIcon from '@mui/icons-material/Reply';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export interface CommentsProps {
  name: string;
  pfp: Buffer;
  content: string;
  isTop: boolean;
  onReply: () => void;
}

export default function (props: CommentsProps) {
  let pfpComponent = <AccountCircleIcon fontSize="large" />;
  let reply = (
    <IconButton onClick={props.onReply} className="replyButton">
      <ReplyIcon fontSize="small" />
    </IconButton>
  );
  if (!props.isTop) {
    reply = <></>;
  }
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '4px',
        margin: '16px',
        marginLeft: props.isTop ? '16px' : '32px',
        paddingLeft: props.isTop ? '0px' : '16px',
        borderLeft: props.isTop ? 'none' : '2px solid grey',
      }}
    >
      {pfpComponent}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          // TODO: hardcoded value
          height: '48px',
          width: '100%',
        }}
      >
        <Typography variant="h3">{props.name}</Typography>
        <Typography variant="caption">{props.content}</Typography>
      </div>
      {reply}
    </div>
  );
}
