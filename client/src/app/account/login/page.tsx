import Link from 'next/link';
import { Typography } from '@mui/material';

import styles from './ui/loginPage.module.css';
import LoginForm from './ui/components/loginForm';

function Page() {
  return (
    <div className={styles.container}>
      {/* <Typography className={styles.body} variant="body1" align="left">
        Join MapHub to edit maps in any way you can imagine. Get access to
        liking, commenting, and sharing others' maps.
      </Typography> */}
      <LoginForm />
    </div>
  );
}

export default Page;