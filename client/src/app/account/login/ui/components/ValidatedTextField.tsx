import { TextField } from "@mui/material";
import { useState, ChangeEventHandler, FocusEventHandler } from "react";

import styles from './validatedTextField.module.css';

/**
 * The ValidatedTextFieldProps are the elements that go into a text field.
 */
interface ValidatedTextFieldProps {
  id: string,
  type: string,
  label: string,
  value: string,
  // Set value is a function that sets the input value state of a parent
  // component.
  setValue: (value: string) => void,
  maxLength?: number,
  error: boolean,
  // Set value is a function that sets the input error state of a parent
  // component.
  validate: () => void,
  helperText: string,
};

/*
 * ValidatedTextField is a component that wraps around the outlined MUI Text
 * Field. It performs validation when the user finishes typing their input 
 * (onBlur). Validation is performed on changes to the input each time
 * afterwards.
 */
function ValidatedTextField({
  id,
  type,
  label,
  value,
  setValue,
  maxLength,
  error,
  validate,
  helperText
}: ValidatedTextFieldProps) {
  // A boolean state indicating whether or not the component should validate
  // the input field.
  const [isValidating, setIsValidating] = useState(false);

  // The change handler controls the input value state, but also validates if
  // necessary. Furthermore, it enforces the maximum length by disallowing
  // changes over the limit.
  const handleChange: ChangeEventHandler = (event) => {
    const inputValue = (event.target as HTMLInputElement).value;
    if ((maxLength && inputValue.length <= maxLength) || !maxLength) {
      setValue(inputValue);
      if (isValidating) {
        validate();
      }
    }
  }

  // The focus handler validates the user input, but also requires that
  // validation is performed on every change afterwards.
  const handleBlur: FocusEventHandler = (event) => {
    setIsValidating(true);
    validate();
  }

  return (
    <TextField
      className={styles.textField}
      id={id}
      type={type}
      label={label}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      variant='outlined'
      error={error}
      helperText={helperText}
      inputProps={{ sx: { backgroundColor: 'white'} }}
    />
  );
}

export default ValidatedTextField;
