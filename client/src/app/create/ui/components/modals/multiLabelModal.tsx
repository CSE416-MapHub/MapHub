import React, { useState } from 'react';
import { TextField } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import LabelSelector from './LabelSelector';

interface MapLabelModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (selectedOptions: string[]) => void;
  properties: string[];
}

const MultiMapLabelModal: React.FC<MapLabelModalProps> = ({
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
      title="Map Label Multi-Selector"
    >
      <LabelSelector
        properties={properties}
        isCheckbox={true}
        onSelect={handleSelectionChange}
      />
    </GeneralizedDialog>
  );
};

export default MultiMapLabelModal;
