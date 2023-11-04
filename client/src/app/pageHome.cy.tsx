import React from 'react';
import Home from './page';

describe('<Home />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Home />);
    cy.get('button').should('contains.text', 'About');
    // cy.get('button').click();
  });
});
