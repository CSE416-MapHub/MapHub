describe('Uploads', () => {
  it('should succeed on a shapefile triplet', () => {
    cy.visit('/create');
    cy.get('button:contains("File")').click();
    cy.get('span:contains("Import")').click();
    cy.get('span:contains("Import File From Local Desktop")').click();
    cy.get('#import-file-upload-button').selectFile([
      './cypress/fixtures/VAT_adm0.dbf',
      './cypress/fixtures/VAT_adm0.shp',
      './cypress/fixtures/VAT_adm0.shx',
    ]);
    cy.get('h2:contains("Import Properties")');
  });

  it('should fail when given a single shx', () => {
    cy.visit('/create');
    cy.get('button:contains("File")').click();
    cy.get('span:contains("Import")').click();
    cy.get('span:contains("Import File From Local Desktop")').click();
    cy.get('#import-file-upload-button').selectFile([
      './cypress/fixtures/VAT_adm0.shx',
    ]);
    cy.get('h2:contains("Import Properties")').should('not.exist');
  });

  it('should read out properties for the Vatican correctly', () => {
    cy.visit('/create');
    cy.get('button:contains("File")').click();
    cy.get('span:contains("Import")').click();
    cy.get('span:contains("Import File From Local Desktop")').click();
    cy.get('#import-file-upload-button').selectFile([
      './cypress/fixtures/VAT_adm0.geojson',
    ]);
    // this is a semirandom subset of properties available
    const props = [
      'ID_0',
      'ISO',
      'NAME_0',
      'OBJECTID_1',
      'ISO3',
      'NAME_ENGLI',
      'SOVEREIGN',
      'ISO2',
      'Transition',
      'OECD',
      'WBREGION',
      'ECOWAS',
      'IGAD',
      'UMA',
      'PALOP',
      'EU',
      'CAN',
      'ACP',
      'Landlocked',
    ];
    for (let p of props) {
      cy.get(`span:contains("${p}")`);
    }
  });

  it('should change the name of the map when I import it', () => {
    cy.visit('/create');
    cy.get('button:contains("File")').click();
    cy.get('span:contains("Import")').click();
    cy.get('span:contains("Import File From Local Desktop")').click();
    cy.get('#import-file-upload-button').selectFile([
      './cypress/fixtures/VAT_adm0.geojson',
    ]);
    cy.get('[value="My New Map"]').type('My Cool Map Name');
    cy.get(`p:contains("Confirm")`).click();
    cy.get('h3:contains("My New MapMy Cool Map Name")');
  });
});
