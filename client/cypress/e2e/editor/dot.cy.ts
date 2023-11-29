describe('i can use the dot tool', () => {
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
    cy.get('li:contains("Dot Density")').click();

    cy.get('p:contains("Confirm")').click();
    // TODO: less hackish way
    cy.get('.MuiBackdrop-invisible').last().click();
    cy.get('.MuiBackdrop-invisible').last().click();
    cy.get('#toolbar-point').click();
    cy.get("h2:contains('New Dot')");
    cy.get('#dot-modal-dot-name-field').type('purple');
    cy.get('#dot-modal-dot-size-field').type('5');
    cy.get("button:contains('Confirm')").click();
    cy.get('.Map_mapContainer__AmIRQ').first().click('center');
    cy.get('.map-dot');
  });
  it('should create a dot map with a category and place a point', () => {
    // test the before each
  });

  it('should be possible to select and drag the dot with the pointer', done => {
    cy.get('#toolbar-select').click();
    cy.get('.map-dot').click();
    cy.get("[value='purple']");
    cy.get("[value='15']");
    cy.get("[type='number']").then($inputs => {
      let origX = parseFloat(($inputs[0] as HTMLInputElement).value);
      let origY = parseFloat(($inputs[1] as HTMLInputElement).value);

      cy.get('.map-dot')
        .trigger('mousedown')
        .trigger('mousemove', { clientX: 300, clientY: 300 })
        .trigger('mouseup');
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

  it('should be possible to change the colors of many dots', () => {
    // cy.get('#toolbar-point').click();
    cy.get('body').trigger('click', { clientX: 300, clientY: 300 });
    cy.get('#toolbar-select').click();
    cy.get('.map-dot').first().click();
    cy.get('.property-color-input').click();
    cy.get('.rcp-field-input').clear().type('#deadbe');
    cy.get('.MuiBackdrop-invisible').last().click();
    cy.wait(500);
    cy.get('[fill="#deadbe"]').then($dots => {
      assert($dots.length === 2);
    });
  });
});
