describe('Files should be exported in different forms', () => {
  it('should properly export as a svg', () => {
    cy.loadVatican();
    cy.get('button:contains("File")').click();
    cy.get('span:contains("Export")').click();
    cy.get('span:contains("Export As SVG")').click();

    // check the downloads
    cy.readFile('./cypress/downloads/map.svg');
  });

  it('should properly export as a png', () => {
    cy.loadVatican();
    cy.get('button:contains("File")').click();
    cy.get('span:contains("Export")').click();
    cy.get('span:contains("Export As PNG")').click();

    // check the downloads
    cy.readFile('./cypress/downloads/map.png');
  });
});
