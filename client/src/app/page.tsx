import React from 'react';
import Link from 'next/link';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import styles from './ui/homePage.module.css';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Typography style={{ fontSize: '3rem' }}>
        MAPHUB - the Porn Hub Alternative for Maps
      </Typography>

      
        <Button className={styles.navButton} variant="contained">
          <Link href="/about">
            About
          </Link>
        </Button>
      <Button className={styles.navButton} variant="contained">
        <Link href="/account/create">
          Join Now
        </Link>
      </Button>
    </main>
  );
}
