'use client';

import { Box, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useContext, useEffect } from 'react';

import { AuthContext } from '../../../context/AuthProvider';
import Button from 'components/button';
import IconButton from 'components/iconButton';
import SettingsMain from './components/settingsMain';
import SettingsHead from './components/settingsHead';
import SettingsPane from './components/settingsPane';
import SettingsSection from './components/settingsSection';
import SettingsTitle from './components/settingsTitle';
import SettingsTextFieldLink from './components/settingsTextFieldLink';
import SettingsAvatar from './components/settingsAvatar';

import styles from './styles/settings.module.scss';

function Settings() {
  const auth = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (auth.state.isLoggedIn === false) {
      router.replace('/account/sign-in');
    }
  }, [auth.state.isLoggedIn]);

  return (
    <SettingsMain id="settings" className={styles['settings__box']}>
      <SettingsHead headlineId={'settings-headline'}>Settings</SettingsHead>
      <SettingsPane>
        <SettingsSection id="settings-profile">
          <SettingsTitle>Profile</SettingsTitle>
          <Box className={styles['settings__option']}>
            <SettingsAvatar>
              <IconButton
                className={styles['settings__edit-icon-button']}
                variant="filled"
                iconType="solid"
                iconName="pencil"
                onClick={() => router.push('/account/settings/profile-picture')}
              />
            </SettingsAvatar>
          </Box>
          <SettingsTextFieldLink
            href="/account/settings/username"
            label="Username"
            value={auth.state.user ? auth.state.user.username : ''}
          />
        </SettingsSection>
        <SettingsSection id="settings-security">
          <SettingsTitle>Security</SettingsTitle>
          <SettingsTextFieldLink
            href="/account/settings/password"
            type="password"
            label="Password"
            value={'********'}
          />
        </SettingsSection>
        <SettingsSection id="settings-delete-account">
          <SettingsTitle className={styles['settings__title--red']}>
            Delete Account
          </SettingsTitle>
          <Typography variant="bodyMedium">
            Once you delete your account, there's no turning back. It will be
            gone forever.
          </Typography>
          <Button
            className={styles['settings__delete-button']}
            variant="errorOutlined"
          >
            Delete Account
          </Button>
        </SettingsSection>
      </SettingsPane>
    </SettingsMain>
  );
}

export default Settings;
