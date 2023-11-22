describe('All Editor Toolbar Modal Opens', () => {
  // it('import modal open', () => {
  //   cy.visit('/create');
  //   cy.get('button:contains("File")').click();
  //   cy.get('span:contains("Import")').click();
  //   cy.get('span:contains("Import File From Local Desktop")').click();
  //   cy.get('h2:contains("Import Properties")');
  // });

  it('recent maps modal open', () => {
    cy.visit('/create');
    cy.get('button:contains("File")').click();
    cy.get('span:contains("Import")').click();
    cy.get('span:contains("Import User Owned Maps")').click();
    cy.get('h2:contains("Recent Maps")');
  });

  it('Map Label Multi-Selector modal open', () => {
    cy.visit('/create');
    cy.get('button:contains("View")').click();
    cy.get('span:contains("Map Label Multi Select")').click();
    cy.get('h2:contains("Map Label Multi-Selector")');
  });

  it('Choropleth Multi-Selector modal open', () => {
    cy.visit('/create');
    cy.get('button:contains("View")').click();
    cy.get('span:contains("Choropleth Label Select")').click();
    cy.get('h2:contains("Choropleth Label Select")');
  });
  // TODO: move this to component test
  // our e2e tests are taking too much time
  // this should really be a component test
  // and this is interfering with foolproof design
  // it('Publish modal open', () => {
  //   cy.visit('/create');
  //   cy.get('button:contains("File")').click();
  //   cy.get('span:contains("Publish")').click();
  //   cy.get('h2:contains("Publish Map")');
  // });
});
