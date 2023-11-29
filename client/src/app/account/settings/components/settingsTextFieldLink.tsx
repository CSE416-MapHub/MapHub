'use client';

import { useRouter } from 'next/navigation';

import Icon from '../../../../components/icon';
import TextField, { TextFieldProps } from '../../../../components/textField';
import styles from '../styles/settings.module.scss';

interface SettingsTextFieldLinkProps
  extends Partial<TextFieldProps<'outlined'>> {
  href: string;
}

function SettingsTextFieldLink({
  className,
  href,
  ...props
}: SettingsTextFieldLinkProps) {
  const router = useRouter();
  const handleClick = () => {
    router.push(href);
  };

  return (
    <TextField
      className={`${styles['settings__text-field']} ${
        className ? className : ''
      }`}
      variant="outlined"
      onClick={handleClick}
      autoComplete="false"
      endAdornment={<Icon type="solid" name="pencil" />}
      inputProps={{
        readOnly: true,
      }}
      {...props}
    />
  );
}

export default SettingsTextFieldLink;
