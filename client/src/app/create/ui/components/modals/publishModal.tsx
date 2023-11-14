import React, { useState } from 'react';
import { TextField, Box, Grid, Typography } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';

interface PublishModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const PublishMapModal: React.FC<PublishModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [mapName, setMapName] = useState('');
  const [description, setDescription] = useState('');
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <GeneralizedDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Publish Map"
    >
      <TextField
        label="Map Name"
        value={mapName}
        onChange={e => setMapName(e.target.value)}
        fullWidth
        margin="normal"
      />{' '}
      <TextField
        label="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={8}
        margin="normal"
      />
    </GeneralizedDialog>
  );
};

export default PublishMapModal;
