/// <reference types="cypress" />
import {
  NotificationsContext,
  NotificationsContextValue,
} from '../../src/context/notificationsProvider';

function createMockNotifications(
  props: Partial<NotificationsContextValue>,
): NotificationsContextValue {
  return {
    state: [],
    dispatch: cy.stub().as('notifications-dispatch'),
    ...props,
  };
}

function MockNotificationsProvider({ children, ...props }) {
  const mockNotifications = createMockNotifications(props);
  return (
    <NotificationsContext.Provider value={mockNotifications}>
      {children}
    </NotificationsContext.Provider>
  );
}

export default MockNotificationsProvider;
