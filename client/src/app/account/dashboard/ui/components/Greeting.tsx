import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import style from './greeting.module.scss';
import { Typography } from '@mui/material';

export interface GreetingProps {
  pfp: Buffer;
  username: string;
}

export default function (props: GreetingProps) {
  let usericon = <AccountCircleIcon sx={{ fontSize: '8rem' }} />;
  if (props.pfp.length !== 0) {
    // TODO make img element
  }

  return (
    <div className={style['greet-banner']}>
      {usericon}
      <Typography variant="headline">Good Morning {props.username}</Typography>
    </div>
  );
}
