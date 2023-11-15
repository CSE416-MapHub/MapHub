import React, { useState } from 'react';
import { TextField, Box, Grid, Typography } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import style from './LabelSelector.module.scss';
import LabelSelector from './LabelSelector';
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
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'left',
          marginBottom: '20px',
        }}
      >
        <Typography noWrap style={{ marginRight: '10px' }}>
          Map Name
        </Typography>
        <TextField
          value={mapName}
          onChange={e => setMapName(e.target.value)}
          margin="normal"
          className={style.textField}
          style={{ flexGrow: 1 }}
        />{' '}
      </Box>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'left',
          marginBottom: '20px',
        }}
      >
        <Typography noWrap style={{ marginRight: '10px' }}>
          Description
        </Typography>
        <TextField
          value={description}
          onChange={e => setDescription(e.target.value)}
          multiline
          rows={8}
          className={style.textField}
          style={{ flexGrow: 1 }}
          margin="normal"
        />
      </Box>
    </GeneralizedDialog>
  );
};

export default PublishMapModal;
