import React, { useContext, useState } from 'react';
import { TextField, Box, Grid, Typography, Button } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import style from './LabelSelector.module.scss';
// import { SketchPicker, ColorResult } from 'react-color';
import { ColorPicker, useColor } from 'react-color-palette';
import 'react-color-palette/css';
import { EditorContext } from 'context/EditorProvider';
import { DeltaType, TargetType } from 'types/delta';
import { GeoJSONVisitor } from 'context/editorHelpers/GeoJSONVisitor';

interface NewDotModalProps {
  open: boolean;
  visitor: GeoJSONVisitor;
  onClose: () => void;
}

const NewLabelModal: React.FC<NewDotModalProps> = ({
  open,
  visitor,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [def, setDef] = useState<string>('');
  const editorContext = useContext(EditorContext);

  const handleConfirm = () => {
    console.log('handling confirm');
    let isNumeric = parseFloat(def).toString() === def;
    visitor.addKey(name, isNumeric);
    editorContext.helpers.addDelta(
      editorContext,
      {
        type: DeltaType.CREATE,
        targetType: TargetType.GEOJSONDATA,
        target: [editorContext.state.map_id, -1, name],
        payload: {
          propertyValue: def,
        },
      },
      {
        type: DeltaType.DELETE,
        targetType: TargetType.GEOJSONDATA,
        target: [editorContext.state.map_id, -1, name],
        payload: {},
      },
    );
    onClose();
  };

  return (
    <GeneralizedDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Create New Property"
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
            Property Name
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
            Default Value
          </Typography>
          <TextField
            value={def}
            className={style.textField}
            onChange={e => setDef(e.target.value)}
            margin="normal"
            style={{ flex: 1 }}
          />
        </Box>
      </Box>
    </GeneralizedDialog>
  );
};

export default NewLabelModal;
