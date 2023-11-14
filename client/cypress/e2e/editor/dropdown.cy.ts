describe('Nested Menus are clickable', () => {
  it('should open nested', () => {
    cy.visit('/create');
    cy.get('p:contains("File")').click();
    cy.get('span:contains("Export")').click();
    cy.get('span:contains("Export As PNG")').click();
  });
});
