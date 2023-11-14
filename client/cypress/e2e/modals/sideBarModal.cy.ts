describe('All Side Bar Properties Modal Opens', () => {
  it('create new Dot open', () => {
    cy.visit('/create');
    cy.get('#dotPopover').click();
    cy.get('span:contains("+ New Dot Type")').click();
    cy.get('p:contains("Create New Dot Type")');
  });
  it('create new symbol open', () => {
    cy.visit('/create');
    cy.get('#symbolPopover').click();
    cy.get('button:contains("+ New Symbol")').click();
    cy.get('p:contains("Create New Symbol")');
  });
  it('create new category open', () => {
    cy.visit('/create');
    cy.get('#demo-simple-select').click();
    cy.get('li:contains("+ New Category")').click();
    cy.get('p:contains("Create New Category")');
  });
  it('delete category modal open', () => {
    cy.visit('/create');
    cy.get('button:contains("Delete Category")').click();
    cy.get('p:contains("Delete Category")');
  });
});
