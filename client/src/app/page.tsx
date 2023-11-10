import React from 'react';
import Link from 'next/link';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Typography variant="h1">
        MAPHUB - The BEST Social Media Map Editor
      </Typography>
      <Link href="/about">
        <Button variant="contained">
            About
          </Button>
        </Link>
  
      <Link href="/account/create">
        <Button variant="contained">
          Join Now
        </Button>
      </Link>
    </main>
  );
}
