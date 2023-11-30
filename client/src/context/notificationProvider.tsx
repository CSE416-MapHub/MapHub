'use client';

import { createContext, useState, PropsWithChildren } from 'react';

interface Notification {
  message: string;
  action?: {
    name: string;
    onClick: Function;
  };
  canClose?: boolean;
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
