describe('successful login', () => {
    it('should have valid input params', () => {
      cy.visit('/');
      cy.get('button:contains("Sign In")').click();
      cy.get('input#username')
        .type('mapHubber')
        .blur()
      
      cy.get('input#username').should('not.have.attr', 'aria-invalid', 'true');

      cy.get('input#password')
        .type('mapHubber123')
        .blur()
      
      cy.wait(500)
      cy.get('input#password').should('not.have.attr', 'aria-invalid', 'true');

      cy.get('#sign-in-confirm').click()

    }); 
  });
  