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
    cy.get('label#email-label').should('have.class', 'Mui-error');
    cy.get('p#email-helper-text').should('contain', 'Please enter a valid email address.');

    cy.get('input#email')
      .clear()
      .type('mapHubber@gmail.com')
      .blur()

    cy.wait(500);
    cy.get('label#email-label').should('not.have.class', 'Mui-error');

  });
});
