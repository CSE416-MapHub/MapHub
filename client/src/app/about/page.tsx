import React from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

export default function AboutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Typography style={{ fontSize: '2rem' }}>MapHub</Typography>
      <Typography>YOYOYOY THIS IS ALLEN POG CHAN HERE</Typography>
      <TextField id="standard-basic" label="Enter Email" variant="standard" />
    </main>
  );
}
