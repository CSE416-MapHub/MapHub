describe('enter in fake account details', () => {
  beforeEach(() => {
    cy.intercept(
      {
        method: 'POST',
        url: 'http://localhost:3031/auth/login',
      },
      {
        statusCode: 200,
        headers: {},
        body: {
          user: {
            id: '6565034debc8f69e8b88c3c9',
            username: 'abc123',
          },
        },
      },
    );

    cy.intercept(
      {
        method: 'POST',
        url: 'http://localhost:3031/auth/logout',
      },
      {
        statusCode: 200,
        headers: {},
        body: {
          success: true,
          message: 'User logged out successfully.',
        },
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:3031/posts/user',
      },
      {
        statusCode: 200,
        headers: {},
        body: {
          posts: [],
        },
      },
    );

    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:3031/map/recents/?numOfMaps=*',
      },
      {
        statusCode: 200,
        headers: {},
        body: {
          success: true,
          maps: [],
        },
      },
    );

    cy.visit('/');
  });

  it('should login with proper credential and logout', () => {
    
    cy.get('button:contains("Sign In")').click();
    cy.get('input#username').type('abc123').blur();
    cy.get('input#password').type('Coolguy64').blur();
    cy.wait(500);
    cy.get('.loginPage_container__rxdEU button:contains("Sign In")').click();

    // Wait for the login request to complete
    cy.wait('@loginRequest').then((interception) => {
      // You can assert on the request or response if needed
      if (interception.response) {
        expect(interception.response.statusCode).to.equal(200);
      }    
    });

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

  it('should login with proper credential and logout', () => {
    cy.visit('/');
    cy.get('button:contains("Sign In")').click();
    cy.get('input#username').type('abc123').blur();

    cy.get('input#password').type('Coolguy64').blur();

    cy.wait(500);
    cy.get('#sign-in-confirm').click();

    cy.wait(500);
    cy.get('#navAvatar_nav-avatar__button__grkGt').click();

    cy.wait(200);
    cy.get('#account-sign-out').click();

    cy.wait(500);
    cy.get('div.navBar_nav__box__O73XO')
      .find('button#navAvatar_nav-avatar__button__grkGt')
      .should('not.exist');
    cy.get('div.navBar_nav__box__O73XO').find('a#signin').should('exist');
    cy.get('div.navBar_nav__box__O73XO').find('a#join-now').should('exist');
  });
});
