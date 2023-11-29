describe('map searching', () => {
    it('should be able to search for a map', () => {
      cy.visit('/');
      cy.get('button:contains("Discover Maps")').click();
  
      cy.wait(500);
      cy.get('#map-card-grid').should('contain', 'korea');
      cy.get('#map-card-grid').should('contain', 'hellooooo')
      cy.get('input').type('korea');

      cy.get('#map-card-grid').should('contain', 'korea');
      cy.get('#map-card-grid').should('not.contain', 'hellooooo')

    });
  });
  