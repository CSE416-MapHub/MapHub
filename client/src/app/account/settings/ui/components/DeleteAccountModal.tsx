import React, { useState } from 'react';
import { TextField, Box, Grid, Typography, Button } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import style from './modal.module.scss';
interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteAccountModal: React.FC<DeleteModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const title = `Delete Account`;
  return (
    <GeneralizedDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={title}
    >
      <Box
        className={style.whiteBg}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignContent: 'center',
          alignItems: 'center',
        }}
      >
        <Typography variant="h3">
          Are you sure you want to{' '}
          <span style={{ fontWeight: 'bold' }}>permanently delete</span> you
          account? This will{' '}
          <span style={{ fontWeight: 'bold' }}>permanently delete</span>
          all comments, published maps, unpublished maps, likes, comments, and
          replies.
        </Typography>
      </Box>
    </GeneralizedDialog>
  );
};

export default DeleteAccountModal;
