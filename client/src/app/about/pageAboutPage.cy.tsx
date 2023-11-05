import React from 'react';
import AboutPage from './page';

describe('<AboutPage />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<AboutPage />);
    cy.contains('MapHub');
  });
});
