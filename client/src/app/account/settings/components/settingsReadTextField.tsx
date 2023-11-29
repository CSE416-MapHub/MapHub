import TextField, { TextFieldProps } from '../../../../components/textField';
import styles from '../styles/settingsTextField.module.scss';

function SettingsTextFieldLink({
  className,
  ...props
}: Partial<TextFieldProps<'outlined'>>) {
  return (
    <TextField
      className={`${styles['settings__text-field']} ${
        styles['settings__text-field--read']
      } ${className ? className : ''}`}
      variant="outlined"
      autoComplete="false"
      inputProps={{
        readOnly: true,
      }}
      {...props}
    />
  );
}

export default SettingsTextFieldLink;
