import 'cypress-file-upload';

beforeEach(() => {
  cy.log('Running Initialization');
});

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      loadVatican(): Chainable<Element>;
    }
  }
}

Cypress.on('log:added', logObject => console.log(logObject));

Cypress.Commands.add('loadVatican', () => {
  cy.visit('/create');
  cy.get('button:contains("File")').click();
  cy.get('span:contains("Import")').click();
  cy.get('span:contains("Import File From Local Desktop")').click();
  cy.get('#import-file-upload-button').attachFile([
    'VAT_adm0.dbf',
    'VAT_adm0.shp',
    // 'VAT_adm0.shx',
  ]);
  cy.get('span:contains("NAME_ISO")');
  cy.get('p:contains("Confirm")').click();
});

export {};
