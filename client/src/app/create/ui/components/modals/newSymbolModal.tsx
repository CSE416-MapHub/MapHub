import React, { useState } from 'react';
import { TextField, Box, Grid, Typography, Button } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';

interface NewSymbolModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const NewSymbolModal: React.FC<NewSymbolModalProps> = ({
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
      title="Create New Symbol"
    >
      <TextField
        label="Map Name"
        value={name}
        onChange={e => setName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField type="file" />
      <Button variant="filled">Upload</Button>
    </GeneralizedDialog>
  );
};

export default NewSymbolModal;
