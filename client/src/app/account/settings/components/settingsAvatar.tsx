import { AvatarProps } from '@mui/material';

import Avatar from 'components/avatar';
import styles from '../styles/settingsAvatar.module.scss';

function SettingsAvatar({ className, children, ...props }: AvatarProps) {
  return (
    <div className={styles['settings__container']}>
      <Avatar
        className={`${styles['settings__avatar']} ${className}`}
        {...props}
      />
      {children}
    </div>
  );
}

export default SettingsAvatar;
