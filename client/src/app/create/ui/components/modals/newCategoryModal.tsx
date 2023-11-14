import React, { useState } from 'react';
import { TextField, Box, Grid, Typography, Button } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import PropertyColorInput from '../PropertyColorInput';

interface NewCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const NewCategoryModal: React.FC<NewCategoryModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState('');

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <GeneralizedDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Create New Category"
    >
      <TextField
        label="Category Name"
        value={name}
        fullWidth
        onChange={e => setName(e.target.value)}
        margin="normal"
      />

      <Typography>
        Color{' '}
        <PropertyColorInput color="#00FF00" colorChangeHandler={() => {}} />
      </Typography>
    </GeneralizedDialog>
  );
};

export default NewCategoryModal;
