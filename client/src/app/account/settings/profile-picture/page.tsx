'use client';

import {
  DragEventHandler,
  FormEventHandler,
  MouseEventHandler,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';

import { AuthActions, AuthContext } from 'context/AuthProvider';
import {
  NotificationsActionType,
  NotificationsContext,
} from 'context/notificationsProvider';
import AccountAPI from 'api/AccountAPI';
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
import { isAxiosError } from 'axios';

function EditProfilePicture() {
  const auth = useContext(AuthContext);
  const notifications = useContext(NotificationsContext);
  const router = useRouter();
  const [manager, updateManager] = useState(new ImageDropZoneManager());
  const [newProfilePic, setNewProfilePic] = useState({ prefix: '', data: '' });

  useEffect(() => {
    if (auth.state.isLoggedIn === false) {
      router.replace('/account/sign-in');
    }
  }, [auth.state.isLoggedIn]);

  const handleNewFiles = async (files: FileList) => {
    try {
      updateManager(manager.addAll(files));
      const b64ProfilePic = (await manager.process())[0];
      setNewProfilePic({
        prefix: `${b64ProfilePic.split(',')[0]},`,
        data: `${b64ProfilePic.split(',')[1]}`,
      });
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

  const handleSubmit: MouseEventHandler = async () => {
    try {
      const response = await AccountAPI.putProfilePic(newProfilePic.data);
      auth.dispatch({
        type: AuthActions.EDIT_PROFILE_PICTURE,
        payload: {
          user: response.data.user,
        },
      });
      router.push('/account/settings');
    } catch (error) {
      if (isAxiosError(error) && error?.response) {
        switch (error.response.data.errorCode) {
          case 1:
          case 2: {
            notifications.dispatch({
              type: NotificationsActionType.enqueue,
              value: {
                message: `Cannot edit profile picture. ${error.response.data.errorMessage}`,
                actions: {
                  close: true,
                },
                autoHideDuration: 5000,
              },
            });
            break;
          }
          case 0:
          default:
            notifications.dispatch({
              type: NotificationsActionType.enqueue,
              value: {
                message: 'Network Error. Cannot edit profile picture.',
                actions: {
                  label: {
                    text: 'Retry',
                    onClick: handleSubmit,
                  },
                },
                autoHideDuration: 5000,
              },
            });
            break;
        }
      } else {
        notifications.dispatch({
          type: NotificationsActionType.enqueue,
          value: {
            message: 'Internal Error. Cannot edit profile picture.',
            actions: {
              close: true,
            },
            autoHideDuration: 5000,
          },
        });
      }
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
          <SettingsAvatar
            src={
              auth.state.user?.profilePic
                ? `data:image/webp;base64,${auth.state.user.profilePic}`
                : undefined
            }
          />

          <SettingsLabel className={styles['edit-profile-pic__label--leading']}>
            New Profile Picture
          </SettingsLabel>
          {newProfilePic.data ? (
            <SettingsAvatar
              src={`${newProfilePic.prefix}${newProfilePic.data}`}
            />
          ) : undefined}
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
        <SettingsButton variant="filled" onClick={handleSubmit}>
          Save
        </SettingsButton>
      </SettingsPane>
    </SettingsMain>
  );
}

export default EditProfilePicture;
