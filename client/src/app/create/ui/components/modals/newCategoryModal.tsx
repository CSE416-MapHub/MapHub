import React, { useState } from 'react';
import { TextField, Box, Grid, Typography, Button } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import PropertyColorInput from '../property/PropertyColorInput';
import style from './LabelSelector.module.scss';
import { SketchPicker, ColorResult } from 'react-color';
import { ColorPicker, IColor, useColor } from 'react-color-palette';

interface NewCategoryModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, color: string) => void;
}

const NewCategoryModal: React.FC<NewCategoryModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState('');
  const [color, setColor] = useColor('#FFFFFF');

  const handleConfirm = () => {
    onConfirm(name, color.hex);
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
          <ColorPicker
            height={100}
            color={color}
            onChange={setColor}
            hideAlpha={true}
            hideInput={['rgb', 'hsv']}
          />
          {/* <SketchPicker onChange={handleColorChange} color={color} /> */}
        </Box>
      </Box>
    </GeneralizedDialog>
  );
};

export default NewCategoryModal;
