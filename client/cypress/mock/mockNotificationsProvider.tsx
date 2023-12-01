/// <reference types="cypress" />
import { NotificationsContext } from '../../src/context/notificationsProvider';

function createMockNotifications(props) {
  const mockNotifications = {
    state: [],
    dispatch: () => {},
    ...props,
  };
  cy.stub(mockNotifications, 'dispatch')
    .as('notifications-dispatch')
    .callsFake(() => {
      mockNotifications.state.shift();
    });
  return mockNotifications;
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
