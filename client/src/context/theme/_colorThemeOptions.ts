import { ThemeOptions } from '@mui/material';

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
    on?: string,
    variant?: string,
    onVariant?: string,
    containerLowest?: string,
    containerLow?: string,
    container?: string,
    containerHigh?: string,
    containerHighest?: string,
    outline?: string,
    outlineVariant?: string,
    inverse?: string,
    onInverse?: string,
    inversePrimary?: string,
    shadow?: string,
    scrim?: string,
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
      main: '#FDF9F0',
      on: '#1D1C16',
      variant: '#E1E2EC',
      onVariant: '#44474F',
      containerLowest: '#FFFFFF',
      containerLow: '#F8F3EA',
      container: '#F2EDE4',
      containerHigh: '#ECE8DF',
      containerHighest: '#E6E2D9',
      outline: '#707686',
      outlineVariant: '#44474F',
      inverse: '#1D1C16',
      onInverse: '#E6E2D9',
      inversePrimary: '#006685',
      shadow: '#000000',
      scrim: '#000000',
    },
  },
};

export default colorThemeOptions;
