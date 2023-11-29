import { Box } from '@mui/material';
import styles from '../styles/settingsSection.module.scss';
import { HTMLAttributes } from 'react';
function SettingsSection({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <Box className={`${styles['settings__section']} ${className}`} {...props}>
      {children}
    </Box>
  );
}

export default SettingsSection;
