'use client';

import clsx from 'clsx';
import Icon from './icon';
import {
  IconButtonProps as MaterialIconButtonProps,
  IconButton as MaterialIconButton,
} from '@mui/material';

import styles from '../styles/iconButton.module.scss';

interface IconButtonProps extends MaterialIconButtonProps {
  variant?: 'filled' | 'tonal' | 'outlined' | 'standard';
  iconType?: 'regular' | 'solid' | 'logo';
  iconName: string;
  selected?: boolean;
}

function IconButton({
  children,
  variant,
  iconType,
  iconName,
  selected = false,
  ...props
}: IconButtonProps) {
  return (
    <MaterialIconButton
      className={`${clsx({
        [styles['icon-button']]: true,
        [styles['icon-button--filled']]: variant === 'filled',
        [styles['icon-button--selected']]: selected,
      })}`}
      disableFocusRipple
      TouchRippleProps={{ classes: { rippleVisible: styles.rippleVisible } }}
      {...props}
    >
      <Icon type={iconType} name={iconName} />
      {children}
    </MaterialIconButton>
  );
}

export default IconButton;
