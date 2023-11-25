
describe('enter in fake account details', () => {
    it('should login with proper credential and logout', () => {
      cy.visit('/');
      cy.get('button:contains("Sign In")').click();
      cy.get('input#username')
        .type('abc123')
        .blur()
  
      cy.get('input#password')
        .type('Coolguy64')
        .blur()
  
      cy.wait(500);
      cy.get('button:contains("Login")').click();

      cy.wait(500);
      cy.get('#navAvatar_nav-avatar__button__grkGt').click()

      cy.wait(200)
      cy.get('#account-sign-out').click()

      cy.wait(500)
      cy.get('div.navBar_nav__box__O73XO')
        .find('button#navAvatar_nav-avatar__button__grkGt')
        .should('not.exist');
      cy.get('div.navBar_nav__box__O73XO')
        .find('a#signin')
        .should('exist')
      cy.get('div.navBar_nav__box__O73XO')
        .find('a#join-now')
        .should('exist')

    });
  });
  