import { ThemeOptions, createTheme } from '@mui/material';

declare module '@mui/material/styles' {
  interface Palette {
    tertiary?: PaletteColor,
    surface?: PaletteColor,
  }

  interface PaletteOptions {
    tertiary?: SimplePaletteColorOptions,
    surface?: PaletteNeutralColorOptions,
  }

  interface PaletteColor {
    on?: string,
    container?: string,
    onContainer?: string,
  }

  interface SimplePaletteColorOptions {
    on?: string,
    container?: string,
    onContainer?: string,
  }

  interface PaletteNeutralColorOptions extends SimplePaletteColorOptions {
    dim?: string,
    dark?: string,
    bright?: string,
    light?: string,
    containerLowest?: string,
    containerLow?: string,
    container?: string,
    containerHigh?: string,
    containerHighest?: string,
    onSurface?: string,
    onSurfaceVariant?: string,
    outline?: string,
    outlineVariant?: string,
    shadow?: string,
  }
}

const colorThemeOptions: ThemeOptions = {
  // On Primary, Secondary, Tertiary, Error, and Other Palette Colors can be
  // referred to as color.contrastText.
  palette: {
    primary: {
      main: '#0081A7',
      light: '#66B3CA',
      dark: '#004D64',
      contrastText: '#F2FBFB',
      on: '#F2FBFB',
      container: '#CCE6ED',
      onContainer: '#001A21',
    },
    secondary: {
      main: '#00AFB9',
      light: '#66CFD5',
      dark: '#00696F',
      contrastText: '#F2FBFB',
      on: '#F2FBFB',
      container: '#CCEFF1',
      onContainer: '#002325',
    },
    tertiary: {
      main: '#FED9B7',
      light: '#FEE8D4',
      dark: '#98826E',
      contrastText: '#332B25',
      on: '#332B25',
      container: '#FFF0E2',
      onContainer: '#665749',
    },
    error: {
      main: '#F07167',
      light: '#F6AAA4',
      dark: '#90443E',
      contrastText: '#FEF8F7',
      on: '#FEF8F7',
      container: '#FCE3E1',
      onContainer: '#301715',
    },
    surface: {
      main: '#FAFAF8',
      light: '#FAFAF8',
      dark: '#DDDDD1',
      contrastText: '#191910',
      dim: '#DDDDD1',
      bright: '#FAFAF8',
      containerLowest: '#FFFFFF',
      containerLow: '#F5F4F1',
      container: '#F0EFEA',
      containerHigh: '#EAEAE3',
      containerHighest: '#E5E5DC',
      onSurface: '#191910',
      outline: '#7E7B4E',
      shadow: '#000000',
    }
  },
};

export default colorThemeOptions;