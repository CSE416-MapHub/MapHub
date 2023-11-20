'use client';
import { Typography } from '@mui/material';
import Button from '../../../../components/button';

import styles from '../ui/forgotAccount.module.css';
import containerstyles from '../../components/form.module.css';
import { useRouter, useSearchParams } from 'next/navigation';

function Page() {

  const router = useRouter();

  const searchParams = useSearchParams();
  const usernameOrPassword = searchParams.get('query');

  const alert = usernameOrPassword == 'username' ? 'Username has been sent to email' : 'Instructions to reset your password have been sent to your email.';

  const handleReturnToLogin = () => {
    if (searchParams.get('query') == 'username') {
      router.back();
      router.back();
    } else {
      router.replace('/account/reset-password');
    }
  };

  return (
    <div className={styles.container}>
      {/* <Typography className={styles.body} variant="body1" align="left">
            Join MapHub to edit maps in any way you can imagine. Get access to
            liking, commenting, and sharing others' maps.
        </Typography> */}
      <div className={containerstyles.container}>
        <Typography className={containerstyles.title} variant='h2'>
          Reset {usernameOrPassword}
        </Typography>
        <Typography className={containerstyles.title} variant='body1'>
          {alert}
        </Typography>
        <Button
          className={containerstyles.confirmButton}
          variant='contained'
          onClick={handleReturnToLogin}
        >
          Return to Login
        </Button>
      </div>
    </div>
  );
}

export default Page;