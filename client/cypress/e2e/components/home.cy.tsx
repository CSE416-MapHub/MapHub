/// <reference types="cypress" />
import React from 'react';
import Home from '../../../src/app/page';
import ThemeProvider from '../../../src/context/themeProvider';

const expected = {
  heroDisplay: 'A Complete Map Visuals Studio',
  heroBody: 'Five Essential Templates. A Plethora of Editing Tools. Unique data-driven approach.',
};

describe('Home page hero renders.', () => {
  beforeEach(() => {
    cy.mount(
      <Home />
    );
    cy.get('#home-hero').as('hero');
  })
  it('Hero box is visible.', () => {
    cy.get('@hero').should('be.visible');
  });
});

describe('Home page contains copy.', () => {
  beforeEach(() => {
    cy.mount(
      <Home />
    );
    cy.get('#home-hero').as('hero');
  });
  it('Contains expected hero display.', () => {
    cy.get('@hero').find('#hero-display').contains(expected.heroDisplay);
  });
  it('Contains expected hero body.', () => {
    cy.get('@hero').find('#hero-body').contains(expected.heroBody);
  });
});

describe('Home page contains navigation buttons.', () => {
  beforeEach(() => {
    cy.mount(
      <Home />
    );
    cy.get('#home-hero').as('hero');
  });
  it('Renders a "Discover Maps" outlined button.', () => {
    cy.get('@hero').find('#hero-discover').as('discover-button');
    cy.get('@discover-button').should('be.visible');
    cy.get('@discover-button').contains('Discover Maps');
    cy.get('@discover-button').should('have.attr', 'href', '/discover');
  });
  it('Renders a "Start Creating" filled button.', () => {
    cy.get('@hero').find('#hero-create').as('create-button');
    cy.get('@create-button').should('be.visible');
    cy.get('@create-button').contains('Start Creating');
    cy.get('@create-button').should('have.attr', 'href', '/create');
  });
});