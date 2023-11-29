import { Box } from '@mui/material';
import styles from '../styles/settingsPane.module.scss';
import { HTMLAttributes } from 'react';

function SettingsPane({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <Box
      className={`${styles['settings__pane']} ${className ? className : ''}`}
      {...props}
    >
      {children}
    </Box>
  );
}

export default SettingsPane;
