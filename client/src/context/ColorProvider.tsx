'use client'

import { PropsWithChildren } from 'react';
import { ThemeProvider } from '@mui/material';
import colorTheme from './theme/colorTheme';

function ColorProvider({ children}: PropsWithChildren) {
  return (
    <ThemeProvider theme={colorTheme}>
      {children}
    </ThemeProvider>
  );
}

export default ColorProvider;
