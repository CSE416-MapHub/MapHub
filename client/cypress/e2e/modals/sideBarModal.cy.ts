describe('All Editor Toolbar Modal Opens', () => {
  it('import modal open', () => {
    cy.visit('/create');
    cy.get('p:contains("File")').click();
    cy.get('span:contains("Import")').click();
    cy.get('span:contains("Import File From Local Desktop")').click();
    cy.get('p:contains("Import Properties")');
  });
});
