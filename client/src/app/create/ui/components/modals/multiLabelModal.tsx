import React, { useContext, useRef, useState } from 'react';
import { TextField } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import LabelSelector from './LabelSelector';
import { EditorContext } from 'context/EditorProvider';
import { DeltaType, TargetType } from 'types/delta';

interface MapLabelModalProps {
  open: boolean;
  onClose: () => void;
  properties: string[];
}

const MultiMapLabelModal: React.FC<MapLabelModalProps> = ({
  open,
  onClose,
  properties,
}) => {
  const editorContext = useContext(EditorContext);
  const oldItems = [...(editorContext.state.map?.labels ?? [])];
  const [selectedOptions, setSelectedOptions] = useState<string[]>(oldItems);

  const handleSelectionChange = (selection: string[]) => {
    setSelectedOptions(selection);
  };

  const handleConfirm = () => {
    editorContext.helpers.addDelta(
      editorContext,
      {
        type: DeltaType.UPDATE,
        targetType: TargetType.LABELS,
        target: [editorContext.state.map_id, -1, '-1'],
        payload: {
          labels: selectedOptions,
        },
      },
      {
        type: DeltaType.UPDATE,
        targetType: TargetType.LABELS,
        target: [editorContext.state.map_id, -1, '-1'],
        payload: {
          labels: oldItems,
        },
      },
    );
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
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
      />
    </GeneralizedDialog>
  );
};

export default MultiMapLabelModal;
