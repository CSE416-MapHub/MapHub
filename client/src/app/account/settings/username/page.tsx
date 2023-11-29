'use client';

import { useContext, useState } from 'react';

import { AuthContext } from '../../../../context/AuthProvider';
//import AccountAPI from '../../../../api/AccountAPI';
import Button from '../../../../components/button';
import SettingsMain from '../components/settingsMain';
import SettingsHead from '../components/settingsHead';
import SettingsPane from '../components/settingsPane';
import SettingsReadTextField from '../components/settingsReadTextField';
import SettingsSection from '../components/settingsSection';
import SettingsTextField from '../components/settingsTextField';
import styles from './styles/editUsername.module.scss';

function Username() {
  const auth = useContext(AuthContext);
  const [newUsername, setNewUsername] = useState('');
  const [newUsernameError, setNewUsernameError] = useState(false);
  const [newUsernameHelperText, setNewUsernameHelperText] = useState('');

  const validate = (value: string) => {
    if (!/^[\w.]{2,15}\w$/.test(value)) {
      setNewUsernameError(true);
      setNewUsernameHelperText(
        'Please enter a valid username between 3-16 ' +
          'alphanumeric, underscore, or dot characters.',
      );
    } else {
      setNewUsernameError(false);
      setNewUsernameHelperText('');
    }
  };

  return (
    <SettingsMain>
      <SettingsHead back={{ name: 'Settings', href: '/account/settings' }}>
        Edit Username
      </SettingsHead>
      <SettingsPane>
        <SettingsSection className={styles['edit-username__section']}>
          <SettingsReadTextField
            label="Current Username"
            value={auth.state.user?.username}
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
          <Button className={styles['edit-username__button']} variant="filled">
            Save
          </Button>
        </SettingsSection>
      </SettingsPane>
    </SettingsMain>
  );
}

export default Username;
