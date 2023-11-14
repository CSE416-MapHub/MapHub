import React, { useState } from 'react';
import { TextField, Box, Grid, Typography, Button } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import PropertyColorInput from '../PropertyColorInput';

interface NewDotModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const NewDotModal: React.FC<NewDotModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState('');
  const [opacity, setOpacity] = useState(1);
  const [size, setSize] = useState(1);
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <GeneralizedDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Create New Dot Type"
    >
      <TextField
        label="Dot Name"
        value={name}
        onChange={e => setName(e.target.value)}
        margin="normal"
      />
      <TextField
        label="Dot Opacity"
        value={opacity}
        type="number"
        onChange={e => {
          const newOpacity = parseInt(e.target.value);
          setOpacity(isNaN(newOpacity) ? opacity : newOpacity);
        }}
        margin="normal"
      />{' '}
      <TextField
        label="Dot Name"
        value={size}
        type="number"
        onChange={e => {
          const newSize = parseInt(e.target.value);
          setSize(isNaN(newSize) ? size : newSize);
        }}
        margin="normal"
      />
      <Typography>
        Color{' '}
        <PropertyColorInput color="#00FF00" colorChangeHandler={() => {}} />
      </Typography>
    </GeneralizedDialog>
  );
};

export default NewDotModal;
