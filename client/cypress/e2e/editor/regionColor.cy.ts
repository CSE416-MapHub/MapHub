describe('I should be able to recolor regions', () => {
  it('should be blue', () => {
    cy.loadVatican();
    cy.get('#toolbar-select').click();
    cy.get('.leaflet-interactive').first().click({
      force: true,
    });
    cy.get('.property-color-input').click();
    cy.get('#hex').type('{selectall}{backspace}#0000FF');
    cy.get('.MuiModal-backdrop').click();
    cy.get('[fill="#0000FF"]').should('exist');
  });
});
