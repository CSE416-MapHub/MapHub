'use client';

import { Box, Typography } from '@mui/material';

import Avatar from 'components/avatar';
import Button from 'components/button';
import Icon from 'components/icon';
import IconButton from 'components/iconButton';
import TextField from '../../../components/textField';

import styles from './styles/settings.module.scss';

function Settings() {
  return (
    <main id="settings" className={styles['settings__box']}>
      <Box className={styles['settings__head']}>
        <Typography id="settings-headline" variant="headlineLarge">
          Settings
        </Typography>
      </Box>
      <Box className={styles['settings__pane']}>
        <Box id="settings-profile" className={styles['settings__group']}>
          <Typography
            className={styles['settings__title']}
            variant="titleLarge"
          >
            Profile
          </Typography>
          <TextField
            className={styles['settings__text-field']}
            variant="outlined"
            label="Username"
            value={''}
            endAdornment={<Icon type="solid" name="pencil" />}
          />
          <Box className={styles['settings__option']}>
            <Typography
              className={styles['settings__label']}
              variant="bodySmall"
            >
              Profile Picture
            </Typography>
            <Avatar className={styles['settings__avatar']}>
              <IconButton
                className={styles['settings__edit-icon-button']}
                variant="filled"
                iconType="solid"
                iconName="pencil"
              />
            </Avatar>
          </Box>
        </Box>
        <Box id="settings-security" className={styles['settings__group']}>
          <Typography
            className={styles['settings__title']}
            variant="titleLarge"
          >
            Security
          </Typography>
          <TextField
            className={styles['settings__text-field']}
            type="password"
            label="Password"
            variant="outlined"
            endAdornment={<Icon type="solid" name="pencil" />}
            value={'********'}
            inputProps={{
              readOnly: true,
            }}
          />
        </Box>
        <Box id="settings-delete-account" className={styles['settings__group']}>
          <Box className={styles['settings__type-group']}>
            <Typography
              className={`${styles['settings__title--warn']} ${styles['settings__title']}`}
              variant="titleLarge"
            >
              Delete Account
            </Typography>
            <Typography variant="bodyMedium">
              Once you delete your account, there's no turning back. It will be
              gone forever.
            </Typography>
          </Box>
          <Button
            className={styles['settings__delete-button']}
            variant="errorOutlined"
          >
            Delete Account
          </Button>
        </Box>
      </Box>
    </main>
  );
}

export default Settings;
