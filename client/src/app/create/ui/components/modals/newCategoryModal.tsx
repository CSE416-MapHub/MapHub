import React, { useState } from 'react';
import { TextField, Box, Grid, Typography, Button } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import PropertyColorInput from '../PropertyColorInput';
import style from './LabelSelector.module.scss';
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
      <Box className={style.whiteBg}>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'left',
            marginBottom: '20px',
          }}
        >
          <Typography
            noWrap
            style={{ marginRight: '10px', flex: '0 0 auto', minWidth: '100px' }}
          >
            Category Name
          </Typography>
          <TextField
            value={name}
            className={style.textField}
            onChange={e => setName(e.target.value)}
            margin="normal"
          />
        </Box>
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'left',
            marginBottom: '20px',
          }}
        >
          <Typography
            noWrap
            style={{ marginRight: '10px', flex: '0 0 auto', minWidth: '100px' }}
          >
            Color
          </Typography>
          <PropertyColorInput color="#00FF00" colorChangeHandler={() => {}} />
        </Box>
      </Box>
    </GeneralizedDialog>
  );
};

export default NewCategoryModal;
