'use client';

import { useContext, useEffect, useState } from 'react';
import {
  NotificationsContext,
  NotificationsActionType,
  Notification,
} from '../../context/notificationsProvider';
import Snackbar from '../../components/snackbar';

function SnackPack() {
  const notifications = useContext(NotificationsContext);
  const [notification, setNotification] = useState<Notification | undefined>(
    undefined,
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (notifications.state.length && !notification) {
      console.log(notifications.state.length, notification);
      // If there is a notification but no snackbar on display, display the new
      // snackbar.
      setNotification(notifications.state[0]);
      notifications.dispatch({
        type: NotificationsActionType.dequeue,
      });
      setOpen(true);
    } else if (notifications.state.length && notification && open) {
      // If there is another notification but a snackbar is currently on
      // display, close the current snackbar.
      setOpen(false);
    }
  }, [notifications.state, notification, open]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleExited = () => {
    setNotification(undefined);
  };

  return (
    <Snackbar
      id="snack-pack"
      key={notification?.key}
      open={open}
      autoHideDuration={notification?.autoHideDuration}
      onClose={handleClose}
      TransitionProps={{
        onExited: handleExited,
      }}
      message={notification?.message}
      actions={notification?.actions}
    />
  );
}

export default SnackPack;
