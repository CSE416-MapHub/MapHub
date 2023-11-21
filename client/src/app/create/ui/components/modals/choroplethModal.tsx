import React, { useState } from 'react';
import { TextField } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import LabelSelector from './LabelSelector'; // Adjust the import path as needed

interface ChoroModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedOptions: string[]) => void; // Added mapName to the callback
  properties: string[];
}

const ChoroplethModal: React.FC<ChoroModalProps> = ({
  open,
  onClose,
  onConfirm,
  properties,
}) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleSelectionChange = (selection: string[]) => {
    setSelectedOptions(selection);
  };

  const handleConfirm = () => {
    onConfirm(selectedOptions);
    onClose();
  };

  return (
    <GeneralizedDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Choropleth Label Select"
    >
      <LabelSelector
        properties={properties}
        isCheckbox={false}
        onSelect={handleSelectionChange}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
      />
    </GeneralizedDialog>
  );
};

export default ChoroplethModal;
