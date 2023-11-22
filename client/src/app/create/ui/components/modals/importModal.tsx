import React, { useContext, useState } from 'react';
import { TextField, Typography, Box, Select, MenuItem } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import LabelSelector from './LabelSelector'; // Adjust the import path as needed
import style from './LabelSelector.module.scss';
import { EditorContext } from 'context/EditorProvider';
import { MapType } from 'types/MHJSON';
interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (
    mapName: string,
    mapType: MapType,
    selectedOptions: string[],
  ) => void; // Added mapName to the callback
  properties: string[];
}

const ImportModal: React.FC<ImportModalProps> = ({
  open,
  onClose,
  onConfirm,
  properties,
}: ImportModalProps) => {
  const [mapName, setMapName] = useState('My New Map');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [mapType, setMapType] = useState<MapType>(MapType.CATEGORICAL);

  const handleSelectionChange = (selection: string[]) => {
    setSelectedOptions(selection);
  };

  const handleConfirm = () => {
    onConfirm(mapName, mapType, selectedOptions);
    onClose();
  };

  return (
    <GeneralizedDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Import Properties"
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <Box
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'left',
            marginBottom: '20px',
          }}
        >
          <Typography style={{ marginRight: '20px' }}>Map Name</Typography>
          <TextField
            value={mapName}
            onChange={e => setMapName(e.target.value)}
            margin="normal"
            className={style.textField}
            style={{
              padding: 0,
            }}
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
          <Typography style={{ marginRight: '20px' }}>Map Type</Typography>
          <Select
            value={mapType}
            onChange={e => setMapType(e.target.value as MapType)}
            className={style.textField}
            style={{
              padding: 0,
            }}
          >
            <MenuItem value={MapType.CHOROPLETH}>Choropleth</MenuItem>
            <MenuItem value={MapType.CATEGORICAL}>Categorical</MenuItem>
            <MenuItem value={MapType.SYMBOL}>Symbol</MenuItem>
            <MenuItem value={MapType.DOT}>Dot Density</MenuItem>
            <MenuItem value={MapType.FLOW}>Flow</MenuItem>
          </Select>
        </Box>
      </Box>

      <LabelSelector
        properties={properties}
        isCheckbox={true}
        onSelect={handleSelectionChange}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
      />
    </GeneralizedDialog>
  );
};

export default ImportModal;
