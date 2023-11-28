// <reference types="cypress" />
import AccountAPI from '../../src/api/AccountAPI';
function mockAccountAPI() {
  cy.stub(AccountAPI, 'logoutUser').resolves();
}

export default mockAccountAPI;
