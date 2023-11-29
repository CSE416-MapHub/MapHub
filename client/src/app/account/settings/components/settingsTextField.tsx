'use client';

import { ChangeEventHandler, FocusEventHandler, useState } from 'react';

import TextField, { TextFieldProps } from '../../../../components/textField';
import styles from '../styles/settingsTextField.module.scss';

interface SettingsTextFieldProps extends Partial<TextFieldProps<'outlined'>> {
  value: string;
  setValue: (value: string) => void;
  maxLength?: number;
  error: boolean;
  validate: (value: string) => void;
  helperText: string;
}
function SettingsTextField({
  className,
  setValue,
  maxLength,
  validate,
  ...props
}: SettingsTextFieldProps) {
  const [isValidating, setIsValidating] = useState(false);

  const handleChange: ChangeEventHandler = event => {
    const inputValue = (event.target as HTMLInputElement).value;
    if ((maxLength && inputValue.length <= maxLength) || !maxLength) {
      setValue(inputValue);
      if (isValidating) {
        validate(inputValue);
      }
    }
  };

  const handleBlur: FocusEventHandler = event => {
    setIsValidating(true);
    validate((event.target as HTMLInputElement).value);
  };

  return (
    <TextField
      className={`${styles['settings__text-field']}`}
      variant="outlined"
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
}

export default SettingsTextField;
