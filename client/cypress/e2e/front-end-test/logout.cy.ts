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
            profilePic: '',
          },
        },
      },
    ).as('login');

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
    ).as('logout');

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
    cy.intercept(
      {
        method: 'GET',
        url: 'http://localhost:3031/posts/user/*',
      },
      {
        statusCode: 200,
        headers: {},
        body: {
          posts: [],
        },
      },
    );

    cy.visit('/');
  });

  it('should logout properly', () => {
    cy.get('button:contains("Sign In")').click();
    cy.get('input#username').type('abc123').blur();
    cy.get('input#password').type('Coolguy64').blur();
    cy.wait(500);
    cy.get('#sign-in-confirm').click();

    // Wait for the login request to complete
    cy.wait('@login').then(interception => {
      // You can assert on the request or response if needed
      if (interception.response) {
        expect(interception.response.statusCode).to.equal(200);
      }
    });

    cy.wait(500);
    cy.get('[id*="nav-avatar"]').click();

    cy.wait(200);
    cy.get('#account-sign-out').click();

    cy.wait(500);
    cy.get('#nav-bar').find('[id*="nav-avatar"]').should('not.exist');
    cy.get('#nav-bar').find('a#signin').should('exist');
    cy.get('#nav-bar').find('a#join-now').should('exist');
  });
});
