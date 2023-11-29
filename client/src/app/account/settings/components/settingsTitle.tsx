import { Typography, TypographyProps } from '@mui/material';
import styles from '../styles/settingsTitle.module.scss';
function SettingsTitle({ children, className, ...props }: TypographyProps) {
  return (
    <Typography
      className={`${styles['settings__title']} ${className ? className : ''}`}
      variant="titleLarge"
      {...props}
    >
      {children}
    </Typography>
  );
}

export default SettingsTitle;
