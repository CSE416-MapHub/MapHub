import React from 'react';
import Link from 'next/link';
import Button from '../components/button';
import Typography from '@mui/material/Typography';
import { Box, Container, colors } from '@mui/material';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Box
        sx={{
          height: '80px', // Set the height to 80px
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Center the content horizontally
        }}
      >
        {/* TODO: Add NavBar here */}
      <Typography variant="h1">
        MAPHUB
      </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '1500px',
          height: '808px',
          borderRadius: 32,
          margin: '40px auto 86px auto',
          marginRight: 500,
          bgcolor: 'primary.container'
        }}
      >
        <Container sx={{
          marginLeft: '50px',
          marginBottom: '30px'
        }}>
          <Typography variant="h1">
            A Complete <br/>
            Map Visuals Studio.
          </Typography>
          <Typography variant='body1' sx={{marginTop: '10px'}}>
            Five Essential Templates.<br/>
            A Plethora of Editing Tools.<br/>
            Unique data-driven approach.
          </Typography>
        </Container>
        <Container sx={{
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          marginLeft: '50px'
        }}>
          <Link href="/discover">
            <Button variant="outlined" sx={{ marginRight: '16px' }}>
                Discover Maps
              </Button>
            </Link>
          <Link href="/register">
          <Button variant="filled">
              Start Creating
            </Button>
          </Link>
        </Container>
      </Box>
    </main>
  );
}
