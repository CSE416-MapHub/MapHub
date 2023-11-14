import Link from 'next/link';
import { Typography } from '@mui/material';

import styles from './ui/forgotUsername.module.css';
// import ForgotUsernameForm from './ui/components/forgotUsernameForm';

function Page() {
  return (
    <div className={styles.container}>
      {/* <Typography className={styles.body} variant="body1" align="left">
        Join MapHub to edit maps in any way you can imagine. Get access to
        liking, commenting, and sharing others' maps.
      </Typography> */}
      {/* <ForgotUsernameForm /> */}
    </div>
  );
}

export default Page;