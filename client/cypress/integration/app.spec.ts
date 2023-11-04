describe('Navigation', () => {
  it('should navigate to the about page', () => {
    //start from home
    cy.visit('http://localhost:3000/');

    //find a href that's about
    cy.get('a[href*="about"]').click();

    //new url should have the /about to test next routing
    cy.url().should('include', '/about');

    //so the header 1 in the about page should say MapHub
    cy.get('h1').contains('MapHub');
  });
});

const asModule = {};
export default asModule;
