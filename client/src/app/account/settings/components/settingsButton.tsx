import { ButtonProps } from '@mui/material';

import Button from 'components/button';

import styles from '../styles/settingsButton.module.scss';

function SettingsButton({ className, children, ...props }: ButtonProps) {
  return (
    <Button className={`${styles['settings__button']} ${className}`} {...props}>
      {children}
    </Button>
  );
}

export default SettingsButton;
