import clsx from 'clsx';
import { TextField as MaterialTextField } from '@mui/material';
import {
  StandardTextFieldProps as MaterialStandardTextFieldProps,
  FilledTextFieldProps as MaterialFilledTextFieldProps,
  OutlinedTextFieldProps as MaterialOutlinedTextFieldProps,
  TextFieldVariants,
} from '@mui/material';
import styles from '../styles/textField.module.scss';
import { ReactNode } from 'react';

interface StandardTextFieldProps extends MaterialStandardTextFieldProps {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
}
interface FilledTextFieldProps extends MaterialFilledTextFieldProps {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
}

interface OutlinedTextFieldProps extends MaterialOutlinedTextFieldProps {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
}

export type TextFieldProps<
  Variant extends TextFieldVariants = TextFieldVariants,
> = Variant extends 'filled'
  ? FilledTextFieldProps
  : Variant extends 'standard'
    ? StandardTextFieldProps
    : OutlinedTextFieldProps;

function TextField({
  className,
  variant,
  startAdornment,
  endAdornment,
  ...props
}: TextFieldProps) {
  return (
    <MaterialTextField
      className={`${clsx({
        [styles['text-field--filled']]: variant === 'filled',
        [styles['text-field--outlined']]: variant === 'outlined',
        [styles['text-field']]: true,
      })} ${className}`}
      FormHelperTextProps={{
        classes: {
          root: styles['text-field__support'],
        },
      }}
      InputLabelProps={{
        classes: {
          root: styles['text-field__label'],
          shrink: styles['text-field__label--populated'],
        },
      }}
      InputProps={{
        classes: {
          root: styles['text-field__container'],
          input: styles['text-field__input'],
          notchedOutline: styles['text-field__outline'],
          adornedStart: styles['text-field__leading'],
          adornedEnd: styles['text-field__trailing'],
          disabled: styles['text-field--disabled'],
          focused: styles['text-field--focused'],
          error: styles['text-field--error'],
        },
        startAdornment,
        endAdornment,
      }}
      {...props}
    />
  );
}

export default TextField;
