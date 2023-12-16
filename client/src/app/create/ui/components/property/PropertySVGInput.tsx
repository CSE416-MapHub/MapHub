'use client';

import { IconButton, Paper, Popover } from '@mui/material';
import { useState } from 'react';
import InterestsIcon from '@mui/icons-material/Interests';
import styles from './Property.module.scss';
import Button from 'components/button';
import NewSymbolModal from '../modals/newSymbolModal';

interface IPropertySVGInputProps {
  items: Array<string>;
  onChange: (val: string) => void;
}

export default function ({ items, onChange }: IPropertySVGInputProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openSymbolModal, setOpenSymbolModal] = useState(false);

  // TODO: make SVG modal appear
  function addSVG() {}

  function onConfirmSymbolModal(svgFile: File | null, preview: string | null) {
    console.log(preview);
  }
  return (
    <>
      <IconButton
        aria-label="symbolPopover"
        id="symbolPopover"
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
          <Button variant="filled" onClick={() => setOpenSymbolModal(true)}>
            + New Symbol
          </Button>
        </Paper>
      </Popover>
      <NewSymbolModal
        open={openSymbolModal}
        onClose={() => setOpenSymbolModal(false)}
        onConfirm={onConfirmSymbolModal}
      />
    </>
  );
}
