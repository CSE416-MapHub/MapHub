/// <reference types="cypress" />
import { AuthContext, AuthHelpers } from '../../src/context/AuthProvider';

function createMockAuth(props) {
  const mockAuthHelpers = new AuthHelpers();
  cy.stub(mockAuthHelpers, 'login').as('help-login');
  cy.stub(mockAuthHelpers, 'logout').as('help-logout');

  return {
    state: {
      isLoggedIn: false,
      user: null,
      error: '',
    },
    dispatch: () => null,
    helpers: mockAuthHelpers,
    ...props,
  };
}

function MockAuthProvider({ children, ...props }) {
  const mockAuth = createMockAuth(props);
  return (
    <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
  );
}

export default MockAuthProvider;
