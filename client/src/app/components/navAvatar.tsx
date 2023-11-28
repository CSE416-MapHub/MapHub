'use client';

import { MouseEventHandler, useContext, useState } from 'react';
import { useRouter } from 'next/navigation';
import AccountAPI from 'api/AccountAPI';
import Avatar from '../../components/avatar';
import Button from '../../components/button';
import Icon from '../../components/icon';
import Menu from '../../components/menu';
import MenuItem from '../../components/menuItem';

import styles from '../styles/navAvatar.module.scss';
import { AuthContext } from 'context/AuthProvider';

function NavAvatar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDashboardClick: MouseEventHandler = () => {
    setAnchorEl(null);
    router.push('/account/dashboard');
  };

  const handleSettingsClick: MouseEventHandler = () => {
    setAnchorEl(null);
    router.push('/account/settings');
  };

  const handleSignOutClick: MouseEventHandler = async () => {
    setAnchorEl(null);
    try {
      const response = await AccountAPI.logoutUser();
      console.log('Logout Successful: ', response);
    } catch (error) {
      console.log('Logout Failed: ', error);
    } finally {
      authContext.helpers.logout(authContext);
      router.replace('/');
    }
  };

  return (
    <>
      <Button
        id={styles['nav-avatar__button']}
        className={styles['nav-avatar__button']}
        aria-controls={open ? 'account-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
      >
        <Avatar className={styles['nav-avatar']} />
      </Button>
      <Menu
        id="account-menu"
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: -4 }}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem id="account-dashboard" onClick={handleDashboardClick}>
          <Icon type="solid" name="dashboard" />
          Dashboard
        </MenuItem>
        <MenuItem id="account-settings" onClick={handleSettingsClick}>
          <Icon type="solid" name="cog" />
          Settings
        </MenuItem>
        <MenuItem id="account-sign-out" onClick={handleSignOutClick}>
          <Icon type="solid" name="log-out" />
          Sign Out
        </MenuItem>
      </Menu>
    </>
  );
}

export default NavAvatar;
