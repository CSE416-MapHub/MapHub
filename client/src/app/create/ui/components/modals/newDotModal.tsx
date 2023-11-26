import React, { useState } from 'react';
import { TextField, Box, Grid, Typography, Button } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import PropertyColorInput from '../PropertyColorInput';
import style from './LabelSelector.module.scss';
import { SketchPicker, ColorResult } from 'react-color';
interface NewDotModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (
    name: string,
    opacity: number,
    size: number,
    color: string,
  ) => void;
}

const NewDotModal: React.FC<NewDotModalProps> = ({
  open,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState('');
  const [opacity, setOpacity] = useState(1);
  const [size, setSize] = useState(1);
  const [color, setColor] = useState<string>('#FFFFF');

  function handleColorChange(c: ColorResult) {
    setColor(c.hex);
  }
  const handleConfirm = () => {
    onConfirm(name, opacity, size, color);
    onClose();
  };

  return (
    <GeneralizedDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Create New Dot Type"
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
            Dot Name
          </Typography>
          <TextField
            value={name}
            className={style.textField}
            onChange={e => setName(e.target.value)}
            margin="normal"
            style={{ flex: 1 }}
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
            Dot Opacity
          </Typography>
          <TextField
            value={opacity}
            type="number"
            className={style.textField}
            onChange={e => {
              const newOpacity = parseInt(e.target.value);
              setOpacity(isNaN(newOpacity) ? opacity : newOpacity);
            }}
            margin="normal"
            style={{ flex: 1 }}
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
            Dot Size
          </Typography>
          <TextField
            value={size}
            type="number"
            onChange={e => {
              const newSize = parseInt(e.target.value);
              setSize(isNaN(newSize) ? size : newSize);
            }}
            className={style.textField}
            margin="normal"
            style={{ flex: 1 }}
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
          {/* <SketchPicker onChange={handleColorChange} color={color} /> */}
        </Box>
      </Box>
    </GeneralizedDialog>
  );
};

export default NewDotModal;
