'use client';

import { IconButton, Paper, Popover } from '@mui/material';
import { useState } from 'react';
import InterestsIcon from '@mui/icons-material/Interests';
import styles from './Property.module.scss';
import Button from 'components/button';

export default function () {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton
        onClick={e => {
          setAnchorEl(e.currentTarget);
        }}
      >
        <InterestsIcon />
      </IconButton>
      <Popover
        open={anchorEl !== null}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <Paper
          sx={{
            width: '196px',
            height: '230px',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div className={styles['svg-grid-container']}>
            <div className={styles['svg-grid']}>
              {new Array(36).fill(0).map((_, i) => (
                <div key={i} className={styles['svg-grid-item']}></div>
              ))}
            </div>
          </div>
          <Button variant="filled">+ New Symbol</Button>
        </Paper>
      </Popover>
    </>
  );
}
