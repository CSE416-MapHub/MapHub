'use client';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { IconButton, MenuItem, MenuList, Popover } from '@mui/material';
import Link from 'next/link';
import { useState } from 'react';

export default function () {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  return (
    <>
      <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
        <AccountCircleIcon />
      </IconButton>
      <Popover
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => {
          setAnchorEl(null);
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
      >
        <MenuList>
          <MenuItem>
            <Link
              href="/account/maps"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              My Maps
            </Link>
          </MenuItem>
          <MenuItem>
            <Link
              href="/account/settings"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              Settings
            </Link>
          </MenuItem>
          <MenuItem>Logout</MenuItem>
        </MenuList>
      </Popover>
    </>
  );
}