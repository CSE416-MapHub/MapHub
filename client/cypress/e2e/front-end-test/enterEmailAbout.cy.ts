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
    cy.get('p#email-helper-text').should('contain', 'Please enter a valid email address.');
  });
});
