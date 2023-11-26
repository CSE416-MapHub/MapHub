/// <reference types="cypress" />
import '../support/component';
import { EditorProvider } from '../../src/context/EditorProvider';
import Toolbar from '../../src/app/create/ui/components/toolbar';
import React from 'react';

describe('Tool bar renders.', () => {
  beforeEach(() => {
    cy.mount(
      <EditorProvider>
        <Toolbar />
      </EditorProvider>,
    );
    cy.get('#toolbar').as('toolbar');
  });
  it('Is visible.', () => {
    cy.get('@toolbar').should('be.visible');
  });
  it('renders a "select" icon button.', () => {
    cy.get('@toolbar').find('#toolbar-select').as('select');
    cy.get('@select');
  });
});

describe('The Toolbar "Select" Icon Button', () => {
  beforeEach(() => {
    cy.mount(
      <EditorProvider>
        <Toolbar />
      </EditorProvider>,
    );
    cy.get('#toolbar').find('#toolbar-select').as('select');
  });
  it('renders visibly.', () => {
    cy.get('@select').should('be.visible');
  });
  it('is clickable.', () => {
    cy.get('@select').click();
  });
  it('is selected after a click.', () => {
    cy.get('@select').click();
    cy.get('@select').invoke('attr', 'class').should('contain', 'selected');
  });
});

describe('The Toolbar "Pan" Icon Button', () => {
  beforeEach(() => {
    cy.mount(<Toolbar />);
    cy.get('#toolbar').find('#toolbar-pan').as('pan');
  });
  it('renders visibly.', () => {
    cy.get('@pan').should('be.visible');
  });
  it('is clickable.', () => {
    cy.get('@pan').click();
  });
  it('is selected after a click.', () => {
    cy.get('@pan').click();
    cy.get('@pan').invoke('attr', 'class').should('contain', 'selected');
  });
});

describe('The Toolbar "Erase" Icon Button', () => {
  beforeEach(() => {
    cy.mount(<Toolbar />);
    cy.get('#toolbar').find('#toolbar-erase').as('erase');
  });
  it('renders visibly.', () => {
    cy.get('@erase').should('be.visible');
  });
  it('is clickable.', () => {
    cy.get('@erase').click();
  });
  it('is selected after a click.', () => {
    cy.get('@erase').click();
    cy.get('@erase').invoke('attr', 'class').should('contain', 'selected');
  });
});

describe('The Toolbar "Point" Icon Button', () => {
  beforeEach(() => {
    cy.mount(<Toolbar />);
    cy.get('#toolbar').find('#toolbar-point').as('point');
  });
  it('renders visibly.', () => {
    cy.get('@point').should('be.visible');
  });
  it('is clickable.', () => {
    cy.get('@point').click();
  });
  it('is selected after a click.', () => {
    cy.get('@point').click();
    cy.get('@point').invoke('attr', 'class').should('contain', 'selected');
  });
});

describe('The Toolbar "Icon" Icon Button', () => {
  beforeEach(() => {
    cy.mount(<Toolbar />);
    cy.get('#toolbar').find('#toolbar-icon').as('icon');
  });
  it('renders visibly.', () => {
    cy.get('@icon').should('be.visible');
  });
  it('is clickable.', () => {
    cy.get('@icon').click();
  });
  it('is selected after a click.', () => {
    cy.get('@icon').click();
    cy.get('@icon').invoke('attr', 'class').should('contain', 'selected');
  });
});

describe('The Toolbar "Path" Icon Button', () => {
  beforeEach(() => {
    cy.mount(<Toolbar />);
    cy.get('#toolbar').find('#toolbar-path').as('path');
  });
  it('renders visibly.', () => {
    cy.get('@path').should('be.visible');
  });
  it('is clickable.', () => {
    cy.get('@path').click();
  });
  it('is selected after a click.', () => {
    cy.get('@path').click();
    cy.get('@path').invoke('attr', 'class').should('contain', 'selected');
  });
});
