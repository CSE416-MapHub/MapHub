'use client';

import styles from '../ui/resetPassword.module.css';
import ResetPasswordForm from '../ui/components/resetPasswordForm';

function Page({ params }: { params: { id: string } }) {
  return (
    <div className={styles.container}>
      {/* <Typography className={styles.body} variant="body1" align="left">
        Join MapHub to edit maps in any way you can imagine. Get access to
        liking, commenting, and sharing others' maps.
      </Typography> */}
      <ResetPasswordForm token={params.id} />
    </div>
  );
}

export default Page;
