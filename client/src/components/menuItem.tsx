import clsx from 'clsx';
import { MenuItem as MaterialMenuItem } from '@mui/material';
import { MenuItemProps } from '@mui/material';

import styles from '../styles/menuItem.module.scss';

function MenuItem({ className, children, disabled, ...props }: MenuItemProps) {
  return (
    <MaterialMenuItem
      className={`${clsx({
        [styles['menu__item']]: true,
        [styles['menu__item--disabled']]: disabled,
      })} ${className}`}
      TouchRippleProps={{ classes: { root: styles['menu__item--active'] } }}
      {...props}
    >
      {children}
    </MaterialMenuItem>
  );
}

export default MenuItem;
