import React from 'react';
import Link from 'next/link';
import Button from '../components/button';
import Typography from '@mui/material/Typography';
import { Box, Container, colors } from '@mui/material';

import styles from './styles/home.module.scss';

function Home() {
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
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '1513px',
          height: '808px',
          borderRadius: 32,
          margin: '50px 191px 86px 50px',
          bgcolor: 'primary.container'
        }}
      >
        <Container sx={{
          marginLeft: '50px',
          marginBottom: '30px'
        }}>
          <Typography variant="h1">
            A Complete
            Map Visuals Studio.
          </Typography>
          <Typography variant='body1' sx={{marginTop: '10px'}}>
            Five Essential Templates.
            A Plethora of Editing Tools.
            Unique data-driven approach.
          </Typography>
        </Container>
        <Container sx={{
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          marginLeft: '50px'
        }}>
          <Link id="hero-discover" href="/about">
            <Button variant="outlined" sx={{ marginRight: '16px' }}>
                Discover Maps
              </Button>
            </Link>
          <Link id="hero-create" href="/account/login">
          <Button variant="filled">
              Start Creating
            </Button>
          </Link>
        </Container>
      </Box>
    </main>
  );
}

export default Home;
