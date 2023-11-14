describe('Inputs are modifiable', () => {
    it('should change text inputs', () => {
      cy.visit('/create');
      cy.get('input[value="CHAD"]').click().type("-1");
      cy.get('input[value="CHAD-1"]')
    });


});
  