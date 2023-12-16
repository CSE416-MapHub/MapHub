'use client';

import { isAxiosError } from 'axios';
import { base64StringToBlob } from 'blob-util';
import { MouseEventHandler, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AuthActions, AuthContext } from '../../../../context/AuthProvider';
import {
  NotificationsActionType,
  NotificationsContext,
} from '../../../../context/notificationsProvider';
import AccountAPI from '../../../../api/AccountAPI';
import SettingsMain from '../components/settingsMain';
import SettingsHead from '../components/settingsHead';
import SettingsPane from '../components/settingsPane';
import SettingsReadTextField from '../components/settingsReadTextField';
import SettingsSection from '../components/settingsSection';
import SettingsTextField from '../components/settingsTextField';
import SettingsButton from '../components/settingsButton.tsx';
import styles from './styles/editUsername.module.scss';

function EditUsername() {
  const auth = useContext(AuthContext);
  const notifications = useContext(NotificationsContext);
  const router = useRouter();

  const [newUsername, setNewUsername] = useState('');
  const [newUsernameError, setNewUsernameError] = useState(false);
  const [newUsernameHelperText, setNewUsernameHelperText] = useState('');

  useEffect(() => {
    if (auth.state.isLoggedIn === false) {
      router.replace('/account/sign-in');
    }
  }, [auth.state.isLoggedIn]);

  const validate = async (value: string) => {
    if (!/^[\w.]{2,15}\w$/.test(value)) {
      setNewUsernameError(true);
      setNewUsernameHelperText(
        'Please enter a valid username between 3-16 ' +
          'alphanumeric, underscore, or dot characters.',
      );
    } else {
      try {
        const response = await AccountAPI.getExists(value);
        if (response.data.exists) {
          setNewUsernameError(true);
          setNewUsernameHelperText(
            'The username is already in use. Please choose another one.',
          );
        } else {
          setNewUsernameError(false);
          setNewUsernameHelperText('');
        }
      } catch (error) {
        setNewUsernameError(true);
        setNewUsernameHelperText(
          'The username availability cannot be checked right now.',
        );
        notifications.dispatch({
          type: NotificationsActionType.enqueue,
          value: {
            message: 'Cannot check username availability.',
            actions: {
              label: {
                text: 'Retry',
                onClick: () => {
                  validate(value);
                },
              },
            },
            autoHideDuration: 3000,
          },
        });
      }
    }
  };

  const handleSaveClick: MouseEventHandler = async () => {
    try {
      const response = await AccountAPI.postUsername(newUsername);
      auth.dispatch({
        type: AuthActions.EDIT_USERNAME,
        payload: {
          user: {
            id: response.data.user.id,
            username: response.data.user.username,
            profilePic: URL.createObjectURL(
              base64StringToBlob(response.data.user.profilePic),
            ),
          },
        },
      });
      router.push('/account/settings');
    } catch (error) {
      if (isAxiosError(error) && error?.response) {
        switch (error.response.data.errorCode) {
          case 1:
          case 2:
          case 3: {
            setNewUsernameError(true);
            setNewUsernameHelperText(error.response.data.errorMessage);
            notifications.dispatch({
              type: NotificationsActionType.enqueue,
              value: {
                message: 'Cannot edit username.',
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
                message: 'Network Error. Cannot edit username.',
                actions: {
                  label: {
                    text: 'Retry',
                    onClick: handleSaveClick,
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
            message: 'Internal Error. Cannot edit username.',
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
    <SettingsMain id="edit-username">
      <SettingsHead
        id="edit-username-head"
        headlineId="edit-username-headline"
        back={{ name: 'Settings', href: '/account/settings' }}
      >
        Edit Username
      </SettingsHead>
      <SettingsPane id="edit-username-pane">
        <SettingsSection className={styles['edit-username__section']}>
          <SettingsReadTextField
            id="current-username"
            label="Current Username"
            value={auth.state.user?.username ? auth.state.user.username : ''}
          />
          <SettingsTextField
            id="new-username"
            label="New Username"
            value={newUsername}
            setValue={setNewUsername}
            error={newUsernameError}
            validate={validate}
            helperText={newUsernameHelperText}
          />
          <SettingsButton variant="filled" onClick={handleSaveClick}>
            Save
          </SettingsButton>
        </SettingsSection>
      </SettingsPane>
    </SettingsMain>
  );
}

export default EditUsername;
