/// <reference types="cypress" />
import { AuthContext, AuthHelpers } from '../../src/context/AuthProvider';

function createMockAuth(props) {
  const mockAuthHelpers = new AuthHelpers();
  cy.stub(mockAuthHelpers, 'login').as('auth-help-login');
  cy.stub(mockAuthHelpers, 'logout').as('auth-help-logout');

  return {
    state: {
      isLoggedIn: false,
      user: null,
      error: '',
    },
    dispatch: cy.stub().as('auth-dispatch'),
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
