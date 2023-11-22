'use client';

import { Menu as MaterialMenu } from '@mui/material';
import { MenuProps } from '@mui/material';

import styles from '../styles/menu.module.scss';

function Menu({ children, ...props }: MenuProps) {
  return (
    <MaterialMenu
      classes={{
        list: styles['menu__list'],
        paper: styles['menu__container'],
      }}
      {...props}
    >
      {children}
    </MaterialMenu>
  );
}

export default Menu;
