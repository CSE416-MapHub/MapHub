describe('i can use the dot tool', () => {
  it('should create a dot map with a category and place a point', () => {
    cy.visit('/create');
    cy.get('button:contains("File")').click();
    cy.get('span:contains("Import")').click();
    cy.get('span:contains("Import File From Local Desktop")').click();
    cy.get('#import-file-upload-button').selectFile(
      [
        // { filePath: 'VAT_adm0.shp', encoding: 'utf-8' },
        // { filePath: 'VAT_adm0.dbf', encoding: 'utf-8' },
        './cypress/fixtures/VAT_adm0.dbf',
        './cypress/fixtures/VAT_adm0.shp',
        // 'VAT_adm0.shx',
      ],
      {
        force: true,
      },
    );
    cy.get('span:contains("NAME_ISO")').click();
    // select dot type
    cy.get('#map-type-dropdown').click();
    cy.get('li:contains("Dot Density")').click();

    cy.get('p:contains("Confirm")').click();
    // TODO: less hackish way
    cy.get('.MuiBackdrop-invisible').last().click();
    cy.get('.MuiBackdrop-invisible').last().click();
    cy.get('#toolbar-point').click();
    cy.get("h2:contains('New Dot')");
    cy.get("button:contains('Confirm')").click();
    cy.get('.Map_mapContainer__AmIRQ').first().click('center');
    cy.get('.map-dot');
  });
});
