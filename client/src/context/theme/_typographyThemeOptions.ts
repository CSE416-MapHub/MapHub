import { ThemeOptions } from '@mui/material';
import { TypographyStyleOptions } from '@mui/material/styles/createTypography';
import { CSSProperties } from 'react';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    display: CSSProperties;
    displayLarge: CSSProperties;
    displayMedium: CSSProperties;
    displaySmall: CSSProperties;
    headline: CSSProperties;
    headlineLarge: CSSProperties;
    headlineMedium: CSSProperties;
    headlineSmall: CSSProperties;
    title: CSSProperties;
    titleLarge: CSSProperties;
    titleMedium: CSSProperties;
    titleSmall: CSSProperties;
    body: CSSProperties;
    bodyLarge: CSSProperties;
    bodyMedium: CSSProperties;
    bodySmall: CSSProperties;
    label: CSSProperties;
    labelLarge: CSSProperties;
    labelMedium: CSSProperties;
    labelSmall: CSSProperties;
    labelProminent: CSSProperties;
    labelProminentLarge: CSSProperties;
    labelProminentMedium: CSSProperties;
  }

  // allow configuration using `createTheme`
  interface TypographyVariantsOptions {
    display?: CSSProperties;
    displayLarge?: CSSProperties;
    displayMedium?: CSSProperties;
    displaySmall?: CSSProperties;
    headline?: CSSProperties;
    headlineLarge?: CSSProperties;
    headlineMedium?: CSSProperties;
    headlineSmall?: CSSProperties;
    title?: CSSProperties;
    titleLarge?: CSSProperties;
    titleMedium?: CSSProperties;
    titleSmall?: CSSProperties;
    body?: CSSProperties;
    bodyLarge?: CSSProperties;
    bodyMedium?: CSSProperties;
    bodySmall?: CSSProperties;
    label?: CSSProperties;
    labelLarge?: CSSProperties;
    labelMedium?: CSSProperties;
    labelSmall?: CSSProperties;
    labelProminent?: CSSProperties;
    labelLargeProminent?: CSSProperties;
    labelMediumProminent?: CSSProperties;
  }
}

// Update the Typography's variant prop options
declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    display: true;
    displayLarge: true;
    displayMedium: true;
    displaySmall: true;
    headline: true;
    headlineLarge: true;
    headlineMedium: true;
    headlineSmall: true;
    title: true;
    titleLarge: true;
    titleMedium: true;
    titleSmall: true;
    body: true;
    bodyLarge: true;
    bodyMedium: true;
    bodySmall: true;
    label: true;
    labelLarge: true;
    labelMedium: true;
    labelSmall: true;
    labelProminent: true;
    labelProminentLarge: true;
    labelProminentMedium: true;
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

const displayLarge: TypographyStyleOptions = {
  fontFamily: `var(--sofia), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '57px',
  letterSpacing: '-0.25px',
  lineHeight: '64px',
};

const displayMedium: TypographyStyleOptions = {
  fontFamily: `var(--sofia), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '45px',
  letterSpacing: '0',
  lineHeight: '52px',
};

const displaySmall: TypographyStyleOptions = {
  fontFamily: `var(--sofia), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '36px',
  letterSpacing: '0',
  lineHeight: '44px',
};

const headlineLarge: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '32px',
  letterSpacing: 0,
  lineHeight: '40px',
};

const headlineMedium: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '28px',
  letterSpacing: 0,
  lineHeight: '36px',
};

const headlineSmall: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '24px',
  letterSpacing: 0,
  lineHeight: '32px',
};

const titleLarge: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '22px',
  letterSpacing: 0,
  lineHeight: '28px',
};

const titleMedium: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 500,
  fontSize: '16px',
  letterSpacing: '0.15px',
  lineHeight: '24px',
};

const titleSmall: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 500,
  fontSize: '14px',
  letterSpacing: '0.1px',
  lineHeight: '20px',
};

const bodyLarge: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '16px',
  letterSpacing: '0.5px',
  lineHeight: '24px',
};

const bodyMedium: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '14px',
  letterSpacing: '0.25px',
  lineHeight: '20px',
};

const bodySmall: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 400,
  fontSize: '12px',
  letterSpacing: '0.4px',
  lineHeight: '16px',
};

const labelLarge: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 500,
  fontSize: '14px',
  letterSpacing: '0.1px',
  lineHeight: '20px',

  textTransform: 'none',
};

const labelLargeProminent: TypographyStyleOptions = {
  ...labelLarge,
  fontWeight: 700,
};

const labelMedium: TypographyStyleOptions = {
  fontFamily: `var(--fira), ${fallbackFontFamilies}`,
  fontWeight: 500,
  fontSize: '12px',
  letterSpacing: '0.5px',
  lineHeight: '16px',

  textTransform: 'none',
};

const labelMediumProminent: TypographyStyleOptions = {
  ...labelMedium,
  fontWeight: 700,
};

const labelSmall: TypographyStyleOptions = {
  fontFamily: `var(--fira) ${fallbackFontFamilies}`,
  fontWeight: 500,
  fontSize: '11px',
  letterSpacing: '0.5px',
  lineHeight: '16px',

  textTransform: 'none',
};

const typographyThemeOptions: ThemeOptions = {
  typography: {
    display: displayLarge,
    displayLarge,
    displayMedium,
    displaySmall,
    headline: headlineLarge,
    headlineLarge,
    headlineMedium,
    headlineSmall,
    title: titleLarge,
    titleLarge,
    titleMedium,
    titleSmall,
    body: bodyLarge,
    bodyLarge,
    bodyMedium,
    bodySmall,
    label: labelLarge,
    labelProminent: labelLargeProminent,
    labelLarge,
    labelLargeProminent,
    labelMedium,
    labelMediumProminent,
    labelSmall,
    h1: displayLarge,
    h2: headlineLarge,
    h3: titleLarge,
    h4: undefined,
    h5: undefined,
    h6: undefined,
    subtitle1: undefined,
    subtitle2: undefined,
    body1: bodyLarge,
    body2: bodyMedium,
    button: labelLarge,
    caption: bodySmall,
    overline: undefined,
  },
  components: {
    MuiTypography: {
      defaultProps: {
        variantMapping: {
          display: 'h1',
          displayLarge: 'h1',
          displayMedium: 'h1',
          displaySmall: 'h1',
          headline: 'h2',
          headlineLarge: 'h2',
          headlineMedium: 'h2',
          headlineSmall: 'h2',
          title: 'h3',
          titleLarge: 'h3',
          titleMedium: 'h3',
          titleSmall: 'h3',
          body: 'p',
          bodyLarge: 'p',
          bodyMedium: 'p',
          bodySmall: 'p',
          label: 'p',
          labelLarge: 'p',
          labelMedium: 'p',
          labelSmall: 'p',
          labelProminent: 'p',
          labelProminentLarge: 'p',
          labelProminentMedium: 'p',
        },
      },
    },
  },
};

export default typographyThemeOptions;
