import React, { useState } from 'react';
import { TextField } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import LabelSelector from './LabelSelector'; // Adjust the import path as needed

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (mapName: string, selectedOptions: string[]) => void; // Added mapName to the callback
  properties: string[];
}

const ImportModal: React.FC<ImportModalProps> = ({
  open,
  onClose,
  onConfirm,
  properties,
}) => {
  const [mapName, setMapName] = useState('');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleSelectionChange = (selection: string[]) => {
    setSelectedOptions(selection);
  };

  const handleConfirm = () => {
    onConfirm(mapName, selectedOptions);
    onClose();
  };

  return (
    <GeneralizedDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Import Properties"
    >
      <TextField
        label="Map Name"
        value={mapName}
        onChange={e => setMapName(e.target.value)}
        fullWidth
        margin="normal"
      />
      <LabelSelector
        properties={properties}
        isCheckbox={true}
        onSelect={handleSelectionChange}
      />
    </GeneralizedDialog>
  );
};

export default ImportModal;
