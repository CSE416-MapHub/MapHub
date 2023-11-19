import 'cypress-file-upload';
describe('Uploads', () => {
  it('should succeed on a shapefile triplet', () => {
    cy.visit('/create');
    cy.get('button:contains("File")').click();
    cy.get('span:contains("Import")').click();
    cy.get('span:contains("Import File From Local Desktop")').click();
    cy.get('#import-file-upload-button').attachFile([
      'VAT_adm0.dbf',
      'VAT_adm0.shp',
      'VAT_adm0.shx',
    ]);
    cy.get('h2:contains("Import Properties")');
  });

  it('should fail when given a single shx', () => {
    cy.visit('/create');
    cy.get('button:contains("File")').click();
    cy.get('span:contains("Import")').click();
    cy.get('span:contains("Import File From Local Desktop")').click();
    cy.get('#import-file-upload-button').attachFile(['VAT_adm0.shx']);
    cy.get('h2:contains("Import Properties")').should('not.exist');
  });
});
