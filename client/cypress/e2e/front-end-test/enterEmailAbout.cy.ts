describe('enter in fake account details', () => {
  it('should display errors for bad email input', () => {
    cy.visit('/');
    cy.get('button:contains("Join Now")').click();
    cy.get('input#username')
      .type('mapHubber')
      .should('have.value', 'mapHubber');

    cy.get('input#email')
      .type('mapHubbergmail.com')
      .blur()

    cy.wait(500);
    cy.get('input#email').should('have.attr', 'aria-invalid', 'true');
    cy.get('p.MuiFormHelperText-root').should('contain', 'Please enter a valid email address.');

    cy.get('input#email')
      .clear()
      .type('mapHubber@gmail.com')
      .blur()

    cy.wait(500);
    cy.get('input#email').should('not.have.attr', 'aria-invalid', 'true');

  });
});
