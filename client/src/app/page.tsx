import React from 'react';
import Link from 'next/link';
import Button from '../components/button';
import Typography from '@mui/material/Typography';
import { Box, Container } from '@mui/material';

import styles from './styles/home.module.scss';

function Home() {
  return (
    <main id="home-hero" className="flex min-h-screen flex-col items-center justify-center p-24">
      <Box
        id="hero-display" className={styles.hero__box}
      >
        <Container id="hero-body" className={styles.hero__contentbox}>
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
          <Link id="hero-discover" href="/discover">
            <Button variant="outlined" sx={{ marginRight: '16px' }}>
                Discover Maps
              </Button>
            </Link>
          <Link id="hero-create" href="/create">
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
