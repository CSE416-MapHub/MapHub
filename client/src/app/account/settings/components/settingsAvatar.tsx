import { HTMLAttributes } from 'react';
import Avatar from 'components/avatar';
import styles from '../styles/settingsAvatar.module.scss';

function SettingsAvatar({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <Avatar className={`${styles['settings__avatar']} ${className}`} {...props}>
      {children}
    </Avatar>
  );
}

export default SettingsAvatar;
