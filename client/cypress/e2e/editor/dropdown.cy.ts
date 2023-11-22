describe('Nested Menus are clickable', () => {
  it('should open nested', () => {
    cy.visit('/create');
    cy.get('button:contains("File")').click();
    cy.get('span:contains("Export")').click();
    cy.once('fail', e => {
      // we expect the click to fail with this message
      expect(e.message).to.include('`cy.click()` failed because this element');
      expect(e.message).to.include(
        'Fix this problem, or use {force: true} to disable error checking.',
      );

      return false;
    });
    cy.get('span:contains("Export As PNG")').click();
  });
});
