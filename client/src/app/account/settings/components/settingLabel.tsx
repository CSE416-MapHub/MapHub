import { Typography } from '@mui/material';
import { HTMLAttributes } from 'react';
import styles from '../styles/settingsLabel.module.scss';

function SettingsLabel({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <Typography
      className={`${styles['settings__label']} ${className}`}
      variant="bodySmall"
      {...props}
    >
      {children}
    </Typography>
  );
}

export default SettingsLabel;
