import React, { useContext, useEffect, useState } from 'react';
import { TextField, Box, Grid, Typography } from '@mui/material';
import GeneralizedDialog from 'components/modals/GeneralizedDialog';
import style from './LabelSelector.module.scss';
import LabelSelector from './LabelSelector';
import { EditorContext } from 'context/EditorProvider';
import MapAPI from 'api/MapAPI';
import PostAPI from 'api/PostAPI';
import { publishMap } from '../helpers/EditorAPICalls';
import { useRouter } from 'next/navigation';
import { NotificationsActionType, NotificationsContext } from 'context/notificationsProvider';
interface PublishModalProps {
  open: boolean;
  onClose: () => void;
}

const PublishMapModal: React.FC<PublishModalProps> = ({ open, onClose }) => {
  const editorContext = useContext(EditorContext);
  const notificationContext = useContext(NotificationsContext);
  const [mapName, setMapName] = useState(
    editorContext.state.map?.title ?? 'My New Map',
  );
  const router = useRouter();
  const [description, setDescription] = useState('');

  useEffect(() => {
    setMapName(editorContext.state.map?.title ?? 'My New Map')
  }, [editorContext.state.map?.title]);

  const showError = (message : string) => {
    notificationContext.dispatch({
      type: NotificationsActionType.enqueue,
      value: {
        message: message,
        actions: {/* actions if any */},
        autoHideDuration: 3000, // Duration in ms
      }
    });
  };

  const handleConfirm = () => {
    editorContext.helpers.changeTitle(editorContext, mapName);
    if (editorContext.state.map) {
      if(description === '') {
        showError('Please include a description.');
        return;
      }
      publishMap(editorContext.state.map_id, mapName, description).then(id => {
        if (id === 'ERROR') {
          //error handling
        } else {
          router.push('/discover/' + id);
          return;
        }
      });
    } else {
      alert('Cannot publish a map with no id');
    }

    onClose();
  };

  return (
    <GeneralizedDialog
      open={open}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Publish Map"
    >
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'left',
          marginBottom: '20px',
        }}
      >
        <Typography noWrap style={{ marginRight: '10px' }}>
          Map Name
        </Typography>
        <TextField
          value={mapName}
          onChange={e => setMapName(e.target.value)}
          margin="normal"
          className={style.textField}
          style={{ flexGrow: 1 }}
        />{' '}
      </Box>
      <Box
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'left',
          marginBottom: '20px',
        }}
      >
        <Typography noWrap style={{ marginRight: '10px' }}>
          Description
        </Typography>
        <TextField
          value={description}
          onChange={e => setDescription(e.target.value)}
          multiline
          rows={8}
          className={style.textField}
          style={{ flexGrow: 1 }}
          margin="normal"
        />
      </Box>
    </GeneralizedDialog>
  );
};

export default PublishMapModal;
