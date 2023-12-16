'use client';
import { Avatar as MaterialAvatar } from '@mui/material';
import { AvatarProps } from '@mui/material';
import Icon from './icon';

import styles from '../styles/avatar.module.scss';

function Avatar({ className, children, src, ...props }: AvatarProps) {
  return (
    <MaterialAvatar
      className={`${styles['avatar']} ${className}`}
      src={src}
      {...props}
    >
      {!src ? <Icon type="solid" name="user" /> : ''}
      {children}
    </MaterialAvatar>
  );
}

export default Avatar;
