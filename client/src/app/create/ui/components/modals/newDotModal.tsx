import React, { useState } from 'react';
import { TextField, Box, Grid, Typography, Button } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import PropertyColorInput from '../PropertyColorInput';
import style from './LabelSelector.module.scss';
// import { SketchPicker, ColorResult } from 'react-color';
import { ColorPicker, Hue, Saturation, useColor } from 'react-color-palette';
import 'react-color-palette/css';

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
  const [color, setColor] = useColor('#0000FF');

  const handleConfirm = () => {
    onConfirm(name, opacity, size, color.hex);
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
            inputProps={{
              step: 0.01,
            }}
            className={style.textField}
            onChange={e => {
              const newOpacity = parseFloat(e.target.value);
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
            inputProps={{
              step: 0.01,
            }}
            onChange={e => {
              const newSize = parseFloat(e.target.value);
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
          {/* TODO: style this better */}
          <ColorPicker
            height={100}
            color={color}
            onChange={setColor}
            hideAlpha={true}
            hideInput={['rgb', 'hsv']}
          />
          ;{/* <SketchPicker onChange={handleColorChange} color={color} /> */}
          {/* <div className="custom-layout">
            <Saturation height={100}  color={color} onChange={setColor} />
            <Hue color={color} onChange={setColor} />
          </div> */}
        </Box>
      </Box>
    </GeneralizedDialog>
  );
};

export default NewDotModal;
