'use client';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import style from './greeting.module.scss';
import { Typography } from '@mui/material';
import { AuthContext } from 'context/AuthProvider';
import { useContext } from 'react';

// export interface GreetingProps {
//   pfp: Buffer;
//   username: string;
// }

export default function () {
  const authContext = useContext(AuthContext);
  console.log('AUTH CONTEXT IS');
  console.log(authContext);

  let usericon = <AccountCircleIcon sx={{ fontSize: '8rem' }} />;
  // if (props.pfp.length !== 0) {
  //   // TODO make img element
  // }

  return (
    <div className={style['greet-banner']}>
      {usericon}
      <Typography variant="headline">
        Good Morning {authContext.state.user?.username}
      </Typography>
    </div>
  );
}
