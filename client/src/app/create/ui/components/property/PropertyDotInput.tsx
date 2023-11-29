'use client';

import {
  IconButton,
  ListItemText,
  MenuItem,
  MenuList,
  Paper,
  Popover,
} from '@mui/material';
import { useContext, useState } from 'react';
import CircleIcon from '@mui/icons-material/Circle';
import styles from './Property.module.scss';
import Button from 'components/button';
import NewDotModal from '../modals/newDotModal';
import { EditorContext } from 'context/EditorProvider';
import { DeltaType, TargetType } from 'types/delta';

export interface PropertyDotInputProps {
  items: Array<string>;
  onChange: (val: string) => void;
}

export default function ({ items, onChange }: PropertyDotInputProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [openDotModal, setOpenDotModal] = useState(false);
  const editorContext = useContext(EditorContext);
  function handleClick(name: string) {
    onChange(name);
  }

  function onConfirmDotModal(
    name: string,
    opacity: number,
    size: number,
    color: string,
  ) {
    let map = editorContext.state.map;
    if (!map) {
      throw new Error('Cannot make dot type without map');
    }
    let mapId = editorContext.state.map_id;
    let targetId = map.globalDotDensityData.length;
    editorContext.helpers.addDelta(
      editorContext,
      {
        type: DeltaType.CREATE,
        targetType: TargetType.GLOBAL_DOT,
        target: [mapId, targetId, '-1'],
        payload: {
          name,
          opacity,
          size,
          color,
        },
      },
      {
        type: DeltaType.DELETE,
        targetType: TargetType.GLOBAL_DOT,
        target: [mapId, targetId, '-1'],
        payload: {},
      },
    );
  }

  return (
    <>
      <IconButton
        aria-label="dotPopover"
        id="dotPopover"
        onClick={e => {
          setAnchorEl(e.currentTarget);
        }}
        sx={{
          height: '40px',
          width: '40px',
        }}
      >
        <CircleIcon fontSize="large" />
      </IconButton>
      <Popover
        open={anchorEl !== null}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={() => {
          setAnchorEl(null);
        }}
      >
        <Paper>
          <MenuList>
            {items.map(item => (
              <MenuItem key={item} onClick={e => handleClick(item)}>
                <ListItemText>{item}</ListItemText>
              </MenuItem>
            ))}
            <MenuItem>
              <ListItemText onClick={() => setOpenDotModal(true)}>
                + New Dot Type{' '}
              </ListItemText>
            </MenuItem>
          </MenuList>
        </Paper>
      </Popover>
      <NewDotModal
        open={openDotModal}
        onClose={() => setOpenDotModal(false)}
        onConfirm={onConfirmDotModal}
      />
    </>
  );
}
