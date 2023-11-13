/// <reference  types="cypress" />
import React from 'react';
import NavBar from '../../src/app/components/navBar';

describe('Navigation Bar', () => {
  it('renders a home link.', () => {
    cy.mount(<NavBar />);
    cy.get('[data-test="home"]').as('home-link');
    cy.get('@home-link').contains('svg');
    cy.get('@home-link').should('be.visible');
    cy.get('@home-link').invoke('href').should('exist');
    cy.get('@home-link').invoke('href').should('be', '/');
    cy.get('@home-link').click();
  });

  it('renders a create text button link.', () => {
    cy.mount(<NavBar/>);
    cy.get('[data-test="create"]').as('create-button');
    cy.get('@create-button').should('be.visible');
    cy.get('@create-button').contains('Create');
    cy.get('@create-button').invoke('href').should('exist');
    cy.get('@create-button').invoke('href').should('be', '/create');
    cy.get('@create-button').click();
  });

  it('renders a discover text button link.', () => {
    cy.mount(<NavBar/>);
    cy.get('[data-test="discover"]').as('discover-button');
    cy.get('@discover-button').should('be.visible');
    cy.get('@discover-button').contains('Discover');
    cy.get('@discover-button').invoke('href').should('exist');
    cy.get('@discover-button').invoke('href').should('be', '/discover');
    cy.get('@discover-button').click();
  });

  it('renders a login outlined button link.', () => {
    cy.mount(<NavBar/>);
    cy.get('[data-test="login"]').as('login-button');
    cy.get('@login-button').should('be.visible');
    cy.get('@login-button').contains('Login');
    cy.get('@login-button').invoke('href').should('exist');
    cy.get('@login-button').invoke('href').should('be', '/account/login');
    cy.get('@login-button').click();
  });

  it('renders a join now filled button link.', () => {
    cy.mount(<NavBar/>);
    cy.get('[data-test="join-now"]').as('join-now-button');
    cy.get('@join-now-button').should('be.visible');
    cy.get('@join-now-button').contains('Join Now');
    cy.get('@join-now-button').invoke('href').should('exist');
    cy.get('@join-now-button').invoke('href').should('be', '/account/create');
    cy.get('@join-now-button').click();
  });
})