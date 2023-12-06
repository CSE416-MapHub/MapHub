describe('enter in password details', () => {
    it('should display errors for bad password input', () => {
      cy.visit('/');
      cy.get('button:contains("Join Now")').click();
      cy.get('input#password')
        .type('abc123')
        .blur()
  
      cy.wait(500);
      cy.get('input#password').should('have.attr', 'aria-invalid', 'true');
      cy.get('p.MuiFormHelperText-root').should('contain', 'Please enter a password with at least eight ' +
      'characters with one uppercase, one lowercase, and one digit');

      cy.get('input#password')
        .clear()
        .type('aaaaaaaa')
        .blur()

      cy.wait(500)
      cy.get('input#password').should('have.attr', 'aria-invalid', 'true');
      cy.get('p.MuiFormHelperText-root').should('contain', 'Please enter a password with at least eight ' +
      'characters with one uppercase, one lowercase, and one digit');

      cy.get('input#password')
        .clear()
        .type('Abc12345')
        .blur()

      cy.wait(500)
      cy.get('input#password').should('not.have.attr', 'aria-invalid', 'true');
  
    }); 
  });
  