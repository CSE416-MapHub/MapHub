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

  const getTimeBasedGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return "Good Morning";
    } else if (currentHour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
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

  let usericon = <AccountCircleIcon sx={{ fontSize: '8rem' }} />;
  // if (props.pfp.length !== 0) {
  //   // TODO make img element
  // }

  return (
    <div className={bannerClass}>
      {usericon}
      <Typography variant="headline">
        {greeting} {authContext.state.user?.username}
      </Typography>
    </div>
  );
}
