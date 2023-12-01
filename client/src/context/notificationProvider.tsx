'use client';

import { createContext, useState, PropsWithChildren } from 'react';
import { SnackbarActions } from '../components/snackbar';

interface Notification {
  message: string;
  // The set of actions to render to the snackbar.
  actions?: SnackbarActions;
  // The number of ms to show the notification.
  autoHideDuration?: number;
}

const NotificationContext = createContext({});

function NotificationProvider({ children }: PropsWithChildren) {
  const [notification, setNotification] = useState<Notification | null>();

  return (
    <NotificationContext.Provider
      value={{ state: notification, set: setNotification }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export { NotificationContext };
export default NotificationProvider;
