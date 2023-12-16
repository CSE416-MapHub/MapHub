'use client';

import {
  DragEventHandler,
  FormEventHandler,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

import { AuthContext } from 'context/AuthProvider';
import {
  NotificationsActionType,
  NotificationsContext,
} from 'context/notificationsProvider';
import ImageDropZoneManager from 'utils/imageDropZoneManager';
import DropZone from 'components/dropZone';
import SettingsMain from '../components/settingsMain';
import SettingsHead from '../components/settingsHead';
import SettingsPane from '../components/settingsPane';
import SettingsSection from '../components/settingsSection';
import SettingsLabel from '../components/settingLabel';
import SettingsAvatar from '../components/settingsAvatar';
import SettingsButton from '../components/settingsButton';

import styles from './styles/editProfilePicture.module.scss';

function EditProfilePicture() {
  const auth = useContext(AuthContext);
  const notifications = useContext(NotificationsContext);
  const router = useRouter();
  const [manager, updateManager] = useState(new ImageDropZoneManager());
  const [newProfilePic, setNewProfilePic] = useState('');

  useEffect(() => {
    if (auth.state.isLoggedIn === false) {
      router.replace('/account/sign-in');
    }
  }, [auth.state.isLoggedIn]);

  const handleNewFiles = async (files: FileList) => {
    try {
      updateManager(manager.addAll(files));
      const processedFiles = await manager.process();
      setNewProfilePic(processedFiles[0]);
    } catch (error) {
      if (error instanceof Error) {
        notifications.dispatch({
          type: NotificationsActionType.enqueue,
          value: {
            message: error.message,
            actions: {
              close: true,
            },
            autoHideDuration: 5000,
          },
        });
      }
    }
  };

  const handleDrop: DragEventHandler = event => {
    event.preventDefault();
    handleNewFiles(event.dataTransfer.files);
  };

  const handleSelect: FormEventHandler = event => {
    event.preventDefault();

    const files = (event.target as HTMLInputElement).files;
    if (files) {
      handleNewFiles(files);
    }
  };

  return (
    <SettingsMain id="edit-profile-pic">
      <SettingsHead
        id="edit-profile-pic-head"
        headlineId="edit-profile-pic-headline"
        back={{ name: 'Settings', href: '/account/settings' }}
      >
        Edit Profile Picture
      </SettingsHead>
      <SettingsPane id="edit-profile-pic-pane">
        <SettingsSection>
          <SettingsLabel className={styles['edit-profile-pic__label--leading']}>
            Current Profile Picture
          </SettingsLabel>
          <SettingsAvatar />

          <SettingsLabel className={styles['edit-profile-pic__label--leading']}>
            New Profile Picture
          </SettingsLabel>
          {newProfilePic ? <SettingsAvatar src={newProfilePic} /> : undefined}
          <DropZone
            className={styles['edit-profile-pic__dropzone']}
            inputId="dropzone-input-profile-pic"
            accept={manager.getAccept()}
            multiple={manager.multiple}
            onDrop={handleDrop}
            onChange={handleSelect}
          >
            Drop a JPG, PNG, or GIF for your profile picture.
          </DropZone>
        </SettingsSection>
        <SettingsButton variant="filled">Save</SettingsButton>
      </SettingsPane>
    </SettingsMain>
  );
}

export default EditProfilePicture;
