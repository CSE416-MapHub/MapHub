import React from 'react';
import Link from 'next/link';
import Button from '../components/button';
import Typography from '@mui/material/Typography';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Typography variant="h1">
        MAPHUB - The BEST Social Media Map Editor
      </Typography>
      <Link href="/about">
        <Button variant="filled">
            About
          </Button>
        </Link>
    </main>
  );
}
