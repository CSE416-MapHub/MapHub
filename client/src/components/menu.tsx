'use client';

import { Menu as MaterialMenu } from '@mui/material';
import { MenuProps } from '@mui/material';

function Menu({ children, ...props }: MenuProps) {
  return (
    <MaterialMenu {...props}>
      {children}
    </MaterialMenu>
  );
}

export default Menu;
