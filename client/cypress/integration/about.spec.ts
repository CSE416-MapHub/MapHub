describe('About Page Navigation', () => {
  it('should navigate from home to about page', () => {
    cy.visit('/');

    cy.get('button:contains("About")').click();

    cy.url().should('include', '/about');

    cy.contains('MapHub'); // Assumes "About Us" is present on the about page
  });
});
