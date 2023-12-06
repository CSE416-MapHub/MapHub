describe('enter in username details', () => {
  it('should display errors for bad username input', () => {
    cy.visit('/');
    cy.get('button:contains("Join Now")').click();
    cy.get('input#username')
      .type('hi')
      .blur()

    cy.wait(500);
    cy.get('input#username').should('have.attr', 'aria-invalid', 'true');
    cy.get('p.MuiFormHelperText-root').should('contain', 'Please enter a valid username between 3-16 ' +
    'alphanumeric, underscore, or dot characters.');

    cy.get('input#username')
      .clear()
      .type('helloworld')
      .blur()

    cy.wait(500)
    cy.get('input#username').should('not.have.attr', 'aria-invalid', 'true');

  }); 
});
