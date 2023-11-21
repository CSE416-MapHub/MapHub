import { ThemeOptions } from '@mui/material';
import { TypographyStyleOptions } from '@mui/material/styles/createTypography';
import { CSSProperties } from 'react';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    display: CSSProperties;
    headline: CSSProperties;
    title: CSSProperties;
    body: CSSProperties;
    bodySmall: CSSProperties;
    label: CSSProperties;
    labelProminent: CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    display?: CSSProperties;
    headline?: CSSProperties;
    title?: CSSProperties;
    body?: CSSProperties;
    bodySmall?: CSSProperties;
    label?: CSSProperties;
    labelProminent?: CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    display: true;
    headline: true;
    title: true;
    body: true;
    bodySmall: true;
    label: true;
    labelProminent: true;
    h1: true;
    h2: true;
    h3: true;
    h4: false;
    h5: false;
    h6: false;
    subtitle1: false;
    subtitle2: false;
    body1: true;
    body2: false;
    button: true;
    caption: true;
    overline: false;
  }
}

const fallbackFontFamilies = 'Helvetica, Arial, sans-serif';

const display: TypographyStyleOptions = {
  fontFamily: `var(--sofia), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '57px',
  letterSpacing: '-0.25px',
  lineHeight: '64px',
};

const headline: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '32px',
  letterSpacing: 0,
  lineHeight: '40px',
};

const title: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '22px',
  letterSpacing: 0,
  lineHeight: '28px',
};

const body: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '16px',
  letterSpacing: '0.5px',
  lineHeight: '24px',
};

const bodySmall: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '12px',
  letterSpacing: '0.4px',
  lineHeight: '16px',
};

const label: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 500,
  fontSize: '14px',
  letterSpacing: '0.1px',
  lineHeight: '20px',

  textTransform: 'none',
};

const labelProminent: TypographyStyleOptions = {
  ...label,
  fontWeight: 700,
};

const typographyThemeOptions: ThemeOptions = {
  typography: {
    display,
    headline,
    title,
    body,
    bodySmall,
    label,
    labelProminent,
    h1: display,
    h2: headline,
    h3: title,
    h4: undefined,
    h5: undefined,
    h6: undefined,
    subtitle1: undefined,
    subtitle2: undefined,
    body1: body,
    body2: body,
    button: label,
    caption: bodySmall,
    overline: undefined,
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          display: 'h1',
          headline: 'h2',
          title: 'h3',
          body: 'p',
        },
      },
    },
  },
};

export default typographyThemeOptions;
