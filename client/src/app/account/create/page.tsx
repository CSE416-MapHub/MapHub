import Link from 'next/link';
import { Typography } from '@mui/material';

import styles from './ui/createAccountPage.module.css';
import CreateAccountForm from './ui/components/createAccountForm';

function Page() {
  return (
    <div className={styles.container}>
      {/* <Typography className={styles.title} variant="h2" align="center">
        Create an account
      </Typography>
      <Typography className={styles.body} variant="body1" align="left">
        Join MapHub to edit maps in any way you can imagine. Get access to
        liking, commenting, and sharing others' maps.
      </Typography> */}
      <CreateAccountForm />
    </div>
  );
}

export default Page;
