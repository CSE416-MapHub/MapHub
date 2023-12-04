'use client';

import { MouseEventHandler } from 'react';
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

function Snackbar({ children, actions, onClose, ...props }: SnackbarProps) {
  const handleIconClose: MouseEventHandler = event => {
    onClose?.(event, 'clickaway');
  };
  const handleActionClose: MouseEventHandler = event => {
    actions?.label?.onClick?.();
    onClose?.(event, 'clickaway');
  };

  return (
    <MaterialSnackbar
      action={
        <>
          {actions?.label ? (
            <Button
              id="snack-label"
              className={styles['snackbar__label']}
              variant="text"
              onClick={handleActionClose}
              TouchRippleProps={{
                classes: {
                  rippleVisible: styles['snackbar__label--press'],
                },
              }}
            >
              {actions.label.text}
            </Button>
          ) : undefined}
          {actions?.close ? (
            <IconButton
              id="snack-icon"
              className={styles['snackbar__icon']}
              iconType="regular"
              iconName="x"
              onClick={handleIconClose}
              TouchRippleProps={{
                classes: { rippleVisible: styles['snackbar__icon--press'] },
              }}
            />
          ) : undefined}
        </>
      }
      onClose={onClose}
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
