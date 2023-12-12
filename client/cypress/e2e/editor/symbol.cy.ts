describe('i can use the symbol tool', () => {
  beforeEach(() => {
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
    cy.get('li:contains("Symbol")').click();

    cy.get('p:contains("Confirm")').click();
    // TODO: less hackish way
    cy.get('.MuiBackdrop-invisible').last().click();
    cy.get('.MuiBackdrop-invisible').last().click();
    cy.get('#toolbar-icon').click();
    cy.get("h2:contains('Create New Symbol')");
    cy.get('#symbol-modal-symbol-name-field').type('purple');
    cy.get('#upload-button').selectFile(
      ['./cypress/fixtures/cloud-svgrepo-com.svg'],
      {
        force: true,
      },
    );
    cy.wait(500);
    cy.get("button:contains('Confirm')").click();
    cy.get('.Map_mapContainer__AmIRQ').first().click('center');
    cy.get('.map-symbol');
  });
  it('should create a symbol and place a it', () => {
    // test the before each
  });

  it('should be possible to select and drag the symbol with the pointer', done => {
    cy.get('#toolbar-select').click();
    cy.get('.map-symbol').click();
    cy.get("[value='purple']");
    cy.get("[type='number']").then($inputs => {
      let origX = parseFloat(($inputs[0] as HTMLInputElement).value);
      let origY = parseFloat(($inputs[1] as HTMLInputElement).value);

      cy.get('.map-symbol').as('sym');
      cy.get('@sym').trigger('mousedown');
      cy.get('@sym').trigger('mousemove', { clientX: 300, clientY: 300 });
      cy.get('@sym').trigger('mouseup');
      cy.wait(500);
      cy.get("[type='number']").then($inputs => {
        let newX = parseFloat(($inputs[0] as HTMLInputElement).value);
        let newY = parseFloat(($inputs[1] as HTMLInputElement).value);
        assert(origX !== newX);
        assert(origY !== newY);
        done(0);
      });
    });
  });
});
