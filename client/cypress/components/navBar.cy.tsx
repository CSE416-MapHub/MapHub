/// <reference  types="cypress" />
import React from 'react';
import NavBar from '../../src/app/components/navBar';

describe('Navigation Bar', () => {
  it('renders a home link.', () => {
    cy.mount(<NavBar />);
    cy.get('#home').as('home-link');
    cy.get('@home-link').children('img').should('be.visible');
    cy.get('@home-link').should('be.visible');
    cy.get('@home-link').should('have.attr', 'href', '/');
  });

  it('renders a create text button link.', () => {
    cy.mount(<NavBar/>);
    cy.get('#create').as('create-button');
    cy.get('@create-button').should('be.visible');
    cy.get('@create-button').contains('Create');
    cy.get('@create-button').should('have.attr', 'href', '/create');
  });

  it('renders a discover text button link.', () => {
    cy.mount(<NavBar/>);
    cy.get('#discover').as('discover-button');
    cy.get('@discover-button').should('be.visible');
    cy.get('@discover-button').contains('Discover');
    cy.get('@discover-button').should('have.attr', 'href', '/discover');
  });

  it('renders a sign in outlined button link.', () => {
    cy.mount(<NavBar/>);
    cy.get('#signin').as('signin-button');
    cy.get('@signin-button').should('be.visible');
    cy.get('@signin-button').contains('Sign In');
    cy.get('@signin-button').should('have.attr', 'href', '/account/login');
  });

  it('renders a join now filled button link.', () => {
    cy.mount(<NavBar/>);
    cy.get('#join-now').as('join-now-button');
    cy.get('@join-now-button').should('be.visible');
    cy.get('@join-now-button').contains('Join Now');
    cy.get('@join-now-button').should('have.attr', 'href', '/account/create');
  });
})