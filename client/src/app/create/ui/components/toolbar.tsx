'use client'

import { useState, MouseEventHandler } from 'react';
import styles from './toolbar.module.scss';
import IconButton from '../../../../components/iconButton';

enum ToolbarButtons {
  select = 'select',
  pan = 'pan',
  erase = 'erase',
  point = 'point',
  icon = 'icon',
  path = 'path',
}

function Toolbar() {
  const [ selectedIconButton, setIconButton ] = useState<ToolbarButtons | null>(null);

  const handleSelectClick: MouseEventHandler  = (event) => {
    setIconButton(selectedIconButton !== ToolbarButtons.select
      ? ToolbarButtons.select
      : null
    );
  };

  const handlePanClick: MouseEventHandler  = (event) => {
    setIconButton(selectedIconButton !== ToolbarButtons.pan
      ? ToolbarButtons.pan
      : null
    );
  };

  const handleEraseClick: MouseEventHandler  = (event) => {
    setIconButton(selectedIconButton !== ToolbarButtons.erase
      ? ToolbarButtons.erase
      : null
    );
  };

  const handlePointClick: MouseEventHandler  = (event) => {
    setIconButton(selectedIconButton !== ToolbarButtons.point
      ? ToolbarButtons.point
      : null
    );
  };

  const handleIconClick: MouseEventHandler  = (event) => {
    setIconButton(selectedIconButton !== ToolbarButtons.icon
      ? ToolbarButtons.icon
      : null
    );
  };

  const handlePathClick: MouseEventHandler  = (event) => {
    setIconButton(selectedIconButton !== ToolbarButtons.path
      ? ToolbarButtons.path
      : null
    );
  };

  return (
    <div id="toolbar" className={styles.toolbar}>
      <IconButton 
        id="toolbar-select"
        iconType="solid"
        iconName="pointer"
        variant="standard"
        onClick={handleSelectClick}
        selected={selectedIconButton === ToolbarButtons.select}
      />
      <IconButton 
        id="toolbar-pan"
        iconType="solid"
        iconName="hand"
        variant="standard"
        onClick={handlePanClick}
        selected={selectedIconButton === ToolbarButtons.pan}
      />
      <IconButton
        id="toolbar-erase"
        iconType="solid"
        iconName="eraser"
        variant="standard"
        onClick={handleEraseClick}
        selected={selectedIconButton === ToolbarButtons.erase}  
      />
      <IconButton
        id="toolbar-point"
        iconType="solid"
        iconName="circle"
        variant="standard"
        onClick={handlePointClick}
        selected={selectedIconButton === ToolbarButtons.point}
      />
      <IconButton
        id="toolbar-icon"
        iconType="solid"
        iconName="shapes"
        variant="standard"
        onClick={handleIconClick}
        selected={selectedIconButton === ToolbarButtons.icon}
        />
      <IconButton
        id="toolbar-path"
        iconType="solid"
        iconName="right-top-arrow-circle"
        variant="standard"
        onClick={handlePathClick}
        selected={selectedIconButton === ToolbarButtons.path}
      />
    </div>
  );
}

export default Toolbar;
