import React, { useState } from 'react';
import { TextField, Box, Grid, Typography, Button } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import PropertyColorInput from '../property/PropertyColorInput';
import style from './LabelSelector.module.scss';
interface DeleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  deleteType: string;
  instanceToBeDeleted: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  open,
  onClose,
  onConfirm,
  deleteType,
  instanceToBeDeleted,
}) => {
  const [name, setName] = useState('');

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const title = `Delete ${deleteType}`;
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
          <span style={{ fontWeight: 'bold' }}>permanently delete</span> the
          following items, and all similiar instances globally:
        </Typography>
        <Typography
          style={{
            marginTop: '20%',
          }}
        >
          ({deleteType}): {instanceToBeDeleted}
        </Typography>
      </Box>
    </GeneralizedDialog>
  );
};

export default DeleteModal;
