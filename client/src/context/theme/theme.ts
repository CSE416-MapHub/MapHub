import { createTheme } from '@mui/material';
import typographyThemeOptions from './_typographyThemeOptions';
import colorThemeOptions from './_colorThemeOptions';

const theme = createTheme({
  ...typographyThemeOptions,
  ...colorThemeOptions,
});

export default theme;