'use client';
import Link from 'next/link';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ImportModal from './ui/components/importModal';
import Button from 'components/button';
import ThemeProvider from 'context/themeProvider';
import { useSelectedLayoutSegment } from 'next/navigation';

function Page() {
  const [open, setOpen] = useState(false);
  const selectedOptions = [
    'Country Name',
    'Languages',
    'Population',
    'chinese',
    '조선글',
  ];
  const [opts, setOpts] = useState<string[]>([]);
  function onClick() {
    setOpen(true);
  }
  function onClose() {
    setOpen(false);
  }
  function onConfirm(mapName: string, optionsProps: string[]) {
    console.log(mapName, optionsProps);
    setOpts(optionsProps);
    setOpen(false);
  }
  return (
    <Box>
      <Button onClick={onClick} variant="filled">
        OPEN MODAL
      </Button>
      <ImportModal
        open={open}
        onClose={onClose}
        onConfirm={onConfirm}
        properties={selectedOptions}
      />
      <Typography>{opts}</Typography>
    </Box>
  );
}

export default Page;
