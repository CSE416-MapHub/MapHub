describe('enter email into about', () => {
  it('should navigate from home to about page', () => {
    cy.visit('/about');
    cy.contains('MapHub');
    cy.get('input#standard-basic')
      .type('fake@email.com')
      .should('have.value', 'fake@email.com');
  });
});
