import React from 'react';
import Link from 'next/link';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Typography style={{ fontSize: '3rem' }}>
        MAPHUB - the Porn Hub Alternative for Maps
      </Typography>

      <Link href="/about">
        <Button
          variant="contained"
          style={{
            width: '100%',
            fontSize: '3rem',
            color: 'white',
            backgroundColor: 'black',
            borderRadius: '25px',
          }}
        >
          About
        </Button>
      </Link>
    </main>
  );
}
