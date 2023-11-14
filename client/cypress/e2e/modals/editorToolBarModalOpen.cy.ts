describe('All Editor Toolbar Modal Opens', () => {
  it('import modal open', () => {
    cy.visit('/create');
    cy.get('p:contains("File")').click();
    cy.get('span:contains("Import")').click();
    cy.get('span:contains("Import File From Local Desktop")').click();
    cy.get('p:contains("Import Properties")');
  });

  it('recent maps modal open', () => {
    cy.visit('/create');
    cy.get('p:contains("File")').click();
    cy.get('span:contains("Import")').click();
    cy.get('span:contains("Import User Owned Maps")').click();
    cy.get('p:contains("Recent Maps")');
  });

  it('Map Label Multi-Selector modal open', () => {
    cy.visit('/create');
    cy.get('p:contains("View")').click();
    cy.get('span:contains("Map Label Multi Select")').click();
    cy.get('p:contains("Map Label Multi-Selector")');
  });

  it('Choropleth Multi-Selector modal open', () => {
    cy.visit('/create');
    cy.get('p:contains("View")').click();
    cy.get('span:contains("Choropleth Label Select")').click();
    cy.get('p:contains("Choropleth Label Select")');
  });
});
