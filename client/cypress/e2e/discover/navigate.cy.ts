describe('I can reach discover', () => {
  it('should not fail to load', () => {
    cy.visit('/');
    cy.get('button:contains("Discover Maps")').click();
    cy.get('input[placeholder="Search for map inspiration"]');
  });

  it('should be easy to see a map post', () => {
    cy.visit('/discover');
    cy.get('p:contains(Russia)').click();
    cy.get('span:contains("Jungkook")');
  });
});
