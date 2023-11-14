describe('Nested Menus are clickable', () => {
    it('should open nested', () => {
      cy.visit('/create');
      cy.get('p:contains("File")').click();
      cy.get('span:contains("Export")').click();
      cy.get('span:contains("Export As PNG")').click();
    });

    it('should run functions', (done) => {
        cy.on('window:alert', (text) => {
            expect(text).to.eq('Published!')
            done()                           
        })
        cy.visit('/create');
        cy.get('p:contains("File")').click();
        cy.get('span:contains("Publish")').click();
      });
});
  