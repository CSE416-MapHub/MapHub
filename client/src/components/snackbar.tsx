'use client';

import { useState } from 'react';
import {
  Snackbar as MaterialSnackbar,
  SnackbarProps as MaterialSnackbarProps,
} from '@mui/material';

import Button from './button';
import IconButton from './iconButton';
import styles from '../styles/snackbar.module.scss';

interface SnackbarActions {
  label?: {
    text: string;
    onClick?: Function;
  };
  close?: boolean;
}

interface SnackbarProps extends Partial<MaterialSnackbarProps> {
  actions?: SnackbarActions;
}

function Snackbar({ children, actions, ...props }: SnackbarProps) {
  const [open, setOpen] = useState(true);

  const handleClose = () => {
    setOpen(false);
  };

  const handleActionClick = () => {
    actions?.label?.onClick ? actions.label.onClick() : null;
    setOpen(false);
  };

  return (
    <MaterialSnackbar
      action={
        <>
          {actions?.label ? (
            <Button
              className={styles['snackbar__label']}
              variant="text"
              onClick={handleActionClick}
              TouchRippleProps={{
                classes: {
                  rippleVisible: styles['snackbar__label--press'],
                },
              }}
            >
              {actions.label.text}
            </Button>
          ) : (
            ''
          )}
          {actions?.close ? (
            <IconButton
              className={styles['snackbar__icon']}
              iconType="regular"
              iconName="x"
              onClick={handleClose}
              TouchRippleProps={{
                classes: { rippleVisible: styles['snackbar__icon--press'] },
              }}
            />
          ) : (
            ''
          )}
        </>
      }
      open={open}
      onClose={handleClose}
      ContentProps={{
        classes: {
          root: styles['snackbar__container'],
          message: styles['snackbar__supporting-text'],
          action: styles['snackbar__trail'],
        },
      }}
      {...props}
    >
      {children}
    </MaterialSnackbar>
  );
}

export type { SnackbarActions };
export default Snackbar;
