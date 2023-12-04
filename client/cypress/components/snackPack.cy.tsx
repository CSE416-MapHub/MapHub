/// <reference types="cypress" />
import '../support/component';
import SnackPack from '../../src/app/components/snackPack';
import MockNotificationsProvider from '../mock/mockNotificationsProvider';

function setup(props = {}) {
  cy.mount(
    <MockNotificationsProvider {...props}>
      <SnackPack />
    </MockNotificationsProvider>,
  );
}

describe('The snack pack with an empty notification queue ', () => {
  beforeEach(() => {
    setup();
  });

  it('should not exist.', () => {
    cy.get('#snack-pack').should('not.exist');
  });
});

describe('The snack pack with a single notification ', () => {
  beforeEach(() => {
    setup({
      state: [
        {
          key: 'ee12ffd8-51c0-475a-a8b1-9b51af66ac3e',
          message: 'Successfully signed in.',
        },
      ],
    });
    cy.get('#snack-pack').as('snack-pack');
  });

  it('should be render the message.', () => {
    cy.get('@snack-pack').should('be.visible');
    cy.get('@snack-pack').contains('Successfully signed in.');
  });

  it('should not render an action label button.', () => {
    cy.get('@snack-pack').find('#snack-label').should('not.exist');
  });

  it('should not render an action icon.', () => {
    cy.get('@snack-pack').find('#snack-icon').should('not.exist');
  });
});

describe('The snack pack with a single notification with label and icon ', () => {
  beforeEach(() => {
    setup({
      state: [
        {
          key: '7769e581-e9be-43ff-aa99-6736bbe74c71',
          message: 'Cannot edit username.',
          actions: {
            label: {
              text: 'Retry',
              onClick: cy.stub().as('label-click'),
            },
            close: true,
          },
        },
      ],
    });
    cy.get('#snack-pack').as('snack-pack');
  });

  it('should render the message.', () => {
    cy.get('@snack-pack').should('be.visible');
    cy.get('@snack-pack').contains('Cannot edit username.');
  });

  it('should render the clickable action label button.', () => {
    cy.get('@snack-pack').find('#snack-label').as('label');
    cy.get('@label').contains('Retry');
    cy.get('@label').click();
    cy.get('@label-click').should('be.calledOnce');
    cy.get('#snack-pack').should('not.exist');
  });

  it('should render the clickable close icon button.', () => {
    cy.get('@snack-pack').find('#snack-icon').as('icon');
    cy.get('@icon').find('i');
    cy.get('@icon').click();
    cy.get('@label-click').should('not.be.calledOn');
    cy.get('#snack-pack').should('not.exist');
  });
});

describe('The snack pack with multiple notifications ', () => {
  beforeEach(() => {
    setup({
      state: [
        {
          key: '7769e581-e9be-43ff-aa99-6736bbe74c71',
          message: 'Cannot edit username.',
          actions: {
            label: {
              text: 'Retry',
              onClick: cy.stub().as('label-click'),
            },
            close: true,
          },
        },
        {
          key: 'ee12ffd8-51c0-475a-a8b1-9b51af66ac3e',
          message: 'Successfully signed in.',
        },
      ],
    });
    cy.get('#snack-pack').as('snack-pack');
  });

  it('should only render the last message.', () => {
    cy.get('@snack-pack').should('be.visible');
    cy.get('@snack-pack').contains('Successfully signed in.');
  });

  it('should not render the first message.', () => {
    cy.get('@snack-pack').contains('Cannot edit username.').should('not.exist');
  });
});
