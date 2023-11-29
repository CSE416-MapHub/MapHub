'use client';

import { MouseEventHandler, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { AuthActions, AuthContext } from '../../../../context/AuthProvider';
import AccountAPI from '../../../../api/AccountAPI';
import Button from '../../../../components/button';
import SettingsMain from '../components/settingsMain';
import SettingsHead from '../components/settingsHead';
import SettingsPane from '../components/settingsPane';
import SettingsReadTextField from '../components/settingsReadTextField';
import SettingsSection from '../components/settingsSection';
import SettingsTextField from '../components/settingsTextField';
import styles from './styles/editUsername.module.scss';
import { base64StringToBlob } from 'blob-util';

function EditUsername() {
  const auth = useContext(AuthContext);
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
        // TODO: Notify the user.
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
      // TODO: Notify the user.
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
          <Button
            className={styles['edit-username__button']}
            variant="filled"
            onClick={handleSaveClick}
          >
            Save
          </Button>
        </SettingsSection>
      </SettingsPane>
    </SettingsMain>
  );
}

export default EditUsername;
