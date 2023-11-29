/// <reference types="cypress" />
import '../support/component';
import Settings from '../../src/app/account/settings/page';
import MockAppRouterProvider from '../mock/MockAppRouterProvider';

const expected = {
  headline: 'Settings',
  profile: {
    title: 'Profile',
    username: 'Username',
    profilePic: 'Profile Picture',
  },
  security: {
    title: 'Security',
    password: 'Password',
  },
  delete: {
    title: 'Delete Account',
    body: "Once you delete your account, there's no turning back. It will be gone forever.",
    buttonText: 'Delete Account',
  },
};
function setUp() {
  cy.mount(
    <MockAppRouterProvider>
      <Settings />
    </MockAppRouterProvider>,
  );
  cy.get('#settings').as('settings');
}

describe('Settings page ', () => {
  beforeEach(setUp);

  it('renders.', () => {
    cy.get('@settings').should('be.visible');
  });
});

describe('Settings headline ', () => {
  beforeEach(() => {
    setUp();
    cy.get('#settings-headline').as('headline');
  });

  it('renders.', () => {
    cy.get('@headline').should('be.visible');
  });

  it('contains expected text.', () => {
    cy.get('@headline').contains(expected.headline);
  });
});

describe('Profile settings ', () => {
  beforeEach(() => {
    setUp();
    cy.get('#settings-profile').as('profile');
  });

  it('render.', () => {
    cy.get('@profile').should('be.visible');
    cy.get('@profile').contains(expected.profile.title);
  });

  it('contain a username option.', () => {
    cy.get('@profile').contains(expected.profile.username);
    cy.get('@profile').find('input');
  });

  it('contain a profile picture option.', () => {
    cy.get('@profile').find('button');
  });
});

describe('Security settings ', () => {
  beforeEach(() => {
    setUp();
    cy.get('#settings-security').as('security');
  });

  it('render.', () => {
    cy.get('@security').should('be.visible');
    cy.get('@security').contains(expected.security.title);
  });

  it('contain a password option.', () => {
    cy.get('@security').contains(expected.security.password);
    cy.get('@security').find('input');
  });
});

describe('Delete account settings ', () => {
  beforeEach(() => {
    setUp();
    cy.get('#settings-delete-account').as('delete');
  });

  it('render.', () => {
    cy.get('@delete').should('be.visible');
    cy.get('@delete').contains(expected.delete.title);
  });

  it('contain expected body.', () => {
    cy.get('@delete').contains(expected.delete.body);
  });

  it('contain expected button text.', () => {
    cy.get('@delete').find('button').contains(expected.delete.buttonText);
  });
});
