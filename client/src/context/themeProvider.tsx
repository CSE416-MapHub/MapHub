'use client'

import { ThemeProvider as MaterialThemeProvider } from "@mui/material"
import { PropsWithChildren } from "react";

import theme from './theme/theme';

function ThemeProvider({ children }: PropsWithChildren) {
  return (
    <MaterialThemeProvider theme={theme}>
      {children}
    </MaterialThemeProvider>
  );
}

export default ThemeProvider;