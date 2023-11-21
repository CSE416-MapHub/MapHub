describe('enter in username details', () => {
  it('should display errors for bad username input', () => {
    cy.visit('/');
    cy.get('button:contains("Join Now")').click();
    cy.get('input#username')
      .type('hi')
      .blur()

    cy.wait(500);
    cy.get('label#username-label').should('have.class', 'Mui-error');
    cy.get('p#username-helper-text').should('contain', 'Please enter a valid username between 3-16 ' +
    'alphanumeric, underscore, or dot characters.');

    cy.get('input#username')
      .clear()
      .type('helloworld')
      .blur()

    cy.wait(500)
    cy.get('label#username-label').should('not.have.class', 'Mui-error');

  }); 
});
