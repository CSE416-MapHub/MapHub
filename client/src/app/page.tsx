import { Typography } from '@mui/material';

import styles from './styles/home.module.scss';
import Link from 'next/link';
import Button from 'components/button';

function Home() {
  return (
    <main className={styles['home__main']}>
      <div id="home-hero" className={styles['hero__box']}>
        <div className={styles['hero__content-box']}>
          <Typography id="hero-display" variant="display">
            A Complete Map Visuals Studio
          </Typography>
        </div>
        <div className={styles['hero__content-box']}>
          <Typography id="hero-body" variant="body">
            Five Essential Templates.
            A Plethora of Editing Tools.
            Unique data-driven approach.
          </Typography>
        </div>
        <div 
          className={`
            ${styles['hero__content-box']} 
            ${styles['hero__content-box--buttons']}`
          }
        >
          <Link id="hero-discover" href="/discover">
            <Button variant="outlined">
              Discover Maps
            </Button>
          </Link>
          <Link id="hero-create" href="/create">
            <Button variant="filled">
              Start Creating
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Home;
