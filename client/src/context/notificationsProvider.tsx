'use client';

import { createContext, useReducer, Dispatch, PropsWithChildren } from 'react';
import { SnackbarActions } from '../components/snackbar';

interface Notification {
  key: string;
  message: string;
  // The set of actions to render to the snackbar.
  actions?: SnackbarActions;
  // The number of ms to show the notification.
  autoHideDuration?: number;
}

enum NotificationsActionType {
  enqueue = 'enqueue',
  dequeue = 'dequeue',
}

type NotificationsAction =
  | { type: NotificationsActionType.enqueue; value: Omit<Notification, 'key'> }
  | { type: NotificationsActionType.dequeue };

interface NotificationsContextValue {
  state: Notification[];
  dispatch: Dispatch<NotificationsAction>;
}

const NotificationsContext = createContext<NotificationsContextValue>({
  state: [],
  dispatch: () => {},
});

function NotificationsProvider({ children }: PropsWithChildren) {
  const notificationsReducer = (
    state: Notification[],
    action: NotificationsAction,
  ): Notification[] => {
    switch (action.type) {
      case NotificationsActionType.enqueue:
        const notification = {
          ...action.value,
          key: crypto.randomUUID(),
        };
        return [...state, notification];
      case NotificationsActionType.dequeue:
        const [_, ...rest] = state;
        return rest;
      default:
        return state;
    }
  };

  const [notifications, dispatchNotifications] = useReducer(
    notificationsReducer,
    [],
  );

  return (
    <NotificationsContext.Provider
      value={{ state: notifications, dispatch: dispatchNotifications }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export type { Notification, NotificationsContextValue };
export { NotificationsContext, NotificationsActionType };
export default NotificationsProvider;
