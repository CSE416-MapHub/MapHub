'use client';

import {
  IconButton,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popover,
} from '@mui/material';
import { useState } from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import styles from './Property.module.scss';
import Button from 'components/button';
import NewDotModal from './modals/newDotModal';

export interface PropertyDotInputProps {
  items: Array<string>;
}

export default function ({ items }: PropertyDotInputProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openDotModal, setOpenDotModal] = useState(false);

  function handleClick(name: string) {}

  function handleAdd() {}
  function onConfirmDotModal() {}

  return (
    <>
      <IconButton
        onClick={e => {
          setAnchorEl(e.currentTarget);
        }}
        sx={{
          height: '40px',
          width: '40px',
        }}
      >
        <CircleIcon fontSize="large" />
      </IconButton>
      <Popover
        open={anchorEl !== null}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <Paper>
          <MenuList>
            {items.map(item => (
              <MenuItem key={item} onClick={e => handleClick(item)}>
                <ListItemText>{item}</ListItemText>
              </MenuItem>
            ))}
            <MenuItem onClick={handleAdd}>
              <ListItemText onClick={() => setOpenDotModal(true)}>
                + New Dot Type{' '}
              </ListItemText>
            </MenuItem>
          </MenuList>
        </Paper>
      </Popover>
      <NewDotModal
        open={openDotModal}
        onClose={() => setOpenDotModal(false)}
        onConfirm={onConfirmDotModal}
      />
    </>
  );
}
