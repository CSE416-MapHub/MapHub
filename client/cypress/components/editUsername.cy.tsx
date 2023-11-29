/// <reference types="cypress" />
import '../support/component';
import EditUsername from '../../src/app/account/settings/username/page';
import MockAppRouterProvider from '../mock/MockAppRouterProvider';
import MockAuthProvider from '../mock/MockAuthProvider';

function setup() {
  cy.mount(
    <MockAppRouterProvider>
      <MockAuthProvider
        state={{
          isLoggedIn: true,
          user: {
            id: '656706e6f6ef6bf602b68934',
            username: 'someUser',
            profilePic: '',
          },
        }}
      >
        <EditUsername />
      </MockAuthProvider>
    </MockAppRouterProvider>,
  );
  cy.get('#edit-username').as('edit');
}
describe('Edit Username page ', () => {
  beforeEach(setup);

  it('renders', () => {
    cy.get('@edit').should('be.visible');
  });
});

describe('The Edit Username headline ', () => {
  beforeEach(() => {
    setup();
    cy.get('#edit-username-headline').as('headline');
  });

  it('renders.', () => {
    cy.get('@headline').should('be.visible');
  });

  it('should contain expected text.', () => {
    cy.get('@headline').contains('Edit Username');
  });
});

describe('The Back to Settings button ', () => {
  beforeEach(() => {
    setup();
    cy.get('#edit-username-head > button').as('back');
  });

  it('renders.', () => {
    cy.get('@back').should('be.visible');
  });

  it('contains expected text.', () => {
    cy.get('@back').contains('Settings');
  });
});

describe('The current username field ', () => {
  beforeEach(() => {
    setup();
    cy.get('#current-username').as('current');
  });

  it('renders.', () => {
    cy.get('@current').should('be.visible');
  });

  it('contains the correct username.', () => {
    cy.get('@current').should('have.attr', 'value', 'someUser');
  });

  it('should be read only.', () => {
    cy.get('@current').should('have.attr', 'readonly');
  });
});

describe('The new username text field ', () => {
  beforeEach(() => {
    setup();
    cy.get('#new-username').as('new');
  });

  it('renders.', () => {
    cy.get('@new').should('be.visible');
  });

  it('changes correctly.', () => {
    cy.get('@new').type('anotherUser');
    cy.get('@new').should('have.value', 'anotherUser');
  });

  it('errors when the username is too short.', () => {
    cy.get('@new').type('fs').blur();
    cy.get('@new').should('have.attr', 'aria-invalid', 'true');
  });
});
