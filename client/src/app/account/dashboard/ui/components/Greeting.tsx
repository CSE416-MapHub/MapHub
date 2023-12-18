'use client';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import style from './greeting.module.scss';
import { Avatar, Typography } from '@mui/material';
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

  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return "Good morning";
    } else if (currentHour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  const greeting = getTimeBasedGreeting();

  const isNightTime = () => {
    const currentHour = new Date().getHours();
    return currentHour >= 18 || currentHour < 6; // Example: Nighttime is from 6 PM to 6 AM
  };

  const nightTime = isNightTime();

  let bannerClass = nightTime
    ? `${style['greet-banner']} ${style['night']}`
    : style['greet-banner'];

  let usericon = authContext.state.user?.profilePic ? <Avatar className={style['dashboard-avatar']} src={authContext.state.user?.profilePic
    ? `data:image/webp;base64,${authContext.state.user.profilePic}`
    : undefined} /> : <AccountCircleIcon sx={{ fontSize: '8rem' }} />;
  // if (props.pfp.length !== 0) {
  //   // TODO make img element
  // }

  return (
    <div className={bannerClass}>
      {usericon}
      <Typography className={style['greeting']} variant="headline">
        {greeting + ','} {authContext.state.user?.username}
      </Typography>
    </div>
  );
}
