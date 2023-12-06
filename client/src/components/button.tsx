import { Button as MaterialButton } from '@mui/material';
import { ButtonProps } from '@mui/material';
import clsx from 'clsx';

import styles from '../styles/button.module.scss';

// Adds a 'filled' variant which is an alias for 'contained'.
declare module '@mui/material' {
  interface ButtonPropsVariantOverrides {
    filled: true;
    error: true;
    errorOutlined: true;
  }
}

/**
 * The Button component wraps the MUI Button component. Props passed to the
 * component will be passed to the MUI component. It implements additional
 * styling for the Button component. It adds a 'filled' alias for the
 * 'contained' button variant. Furthermore, it disables the ripple animation
 * for the focus state.
 */
function Button({ children, className, variant, ...props }: ButtonProps) {
  return (
    <MaterialButton
      className={`${clsx({
        [styles.filled]: variant === 'filled' || variant === 'contained',
        [styles.outlined]: variant === 'outlined',
        [styles.text]: variant === 'text',
        [styles.error]: variant === 'error',
        [styles['error-outlined']]: variant === 'errorOutlined',
      })} ${styles.button} ${className} `}
      variant={variant === 'filled' ? 'contained' : variant}
      disableFocusRipple
      TouchRippleProps={{ classes: { rippleVisible: styles.rippleVisible } }}
      {...props}
    >
      {children}
    </MaterialButton>
  );
}

export default Button;
