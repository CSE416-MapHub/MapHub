'use client';

import { IconButton, Popover } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { useState } from 'react';
import { ColorPicker, IColor, useColor } from 'react-color-palette';
import 'react-color-palette/css';
import style from './Property.module.scss';

export interface ColorInputProps {
  color: string;
  colorChangeHandler: (color: string) => void;
}

export default function ({ color, colorChangeHandler }: ColorInputProps) {
  const [currColor, setColor] = useColor(color);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton
        onClick={e => {
          setAnchorEl(e.currentTarget);
        }}
        sx={{
          width: '48px',
          height: '48px',
        }}
        className="property-color-input"
      >
        <CircleIcon style={{ color: currColor.hex }} />
      </IconButton>
      <Popover
        open={anchorEl !== null}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        onClose={() => {
          setAnchorEl(null);
          colorChangeHandler(currColor.hex);
        }}
      >
        <div className="pp-color-select">
          <ColorPicker
            height={100}
            color={currColor}
            onChange={setColor}
            hideAlpha={true}
            hideInput={['rgb', 'hsv']}
          />
        </div>

        {/* <SketchPicker onChange={handleChange} color={currColor} /> */}
      </Popover>
    </>
  );
}
