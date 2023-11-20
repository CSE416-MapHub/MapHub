describe('Properties in the panel should change as I click', () => {
  it('should give me the name when I click on a feature', () => {
    cy.loadVatican();
    cy.get('.leaflet-interactive').first().click();
    cy.get('[value="HOLY SEE (VATICAN CITY STATE)"]');
  });
});
