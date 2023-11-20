import React from 'react';
import Link from 'next/link';
import Button from '../components/button';
import Typography from '@mui/material/Typography';
import { Box, Container } from '@mui/material';

import styles from './styles/home.module.scss';

function Home() {
  return (
    <main id="home-hero">
      <Box id="hero-display" className={styles['hero__box']}>
        <Container
          id="hero-body"
          className={`
            ${styles['hero__container']}
            ${styles['hero__container--copy']}
          `}
        >
          <Typography variant="h1">A Complete Map Visuals Studio.</Typography>
          <Typography variant="body1">
            Five Essential Templates. A Plethora of Editing Tools. Unique
            data-driven approach.
          </Typography>
        </Container>
        <Container
          className={`
            ${styles['hero__container']}
            ${styles['hero__container--buttons']}
          `}
        >
          <Link id="hero-discover" href="/discover">
            <Button variant="outlined">Discover Maps</Button>
          </Link>
          <Link id="hero-create" href="/create">
            <Button variant="filled">Start Creating</Button>
          </Link>
        </Container>
      </Box>
    </main>
  );
}

export default Home;
