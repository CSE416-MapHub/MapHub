'use client';
import { Avatar as MaterialAvatar } from '@mui/material';
import { AvatarProps } from '@mui/material';
import Icon from './icon';

import styles from '../styles/avatar.module.scss';

function Avatar({ className, src, ...props }: AvatarProps) {
  if (src) {
    return (
      <MaterialAvatar
        className={`${styles['avatar']} ${className}`}
        src={src}
        {...props}
      />
    );
  }
  return (
    <MaterialAvatar className={`${styles['avatar']} ${className}`} {...props}>
      <Icon type="solid" name="user" />
    </MaterialAvatar>
  );
}

export default Avatar;
