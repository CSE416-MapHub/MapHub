/// <reference types="cypress" />
import '../support/component';
import DropZone from '../../src/components/dropZone';

describe('The drop zone ', () => {
  const expectedSupportingText =
    'Drop a JPG, PNG, or GIF for your profile picture.';
  beforeEach('mounts.', () => {
    cy.mount(<DropZone id="cy-dropzone">{expectedSupportingText}</DropZone>);
    cy.get('#cy-dropzone').as('dropzone');
  });

  it('renders.', () => {
    cy.get('@dropzone').should('be.visible');
  });

  it('renders the cloud upload icon.', () => {
    cy.get('@dropzone').find('i').should('have.class', 'bxs-cloud-upload');
  });

  it('renders expected supporting text.', () => {
    cy.get('@dropzone').contains(expectedSupportingText);
  });
});

describe('The drop zone renders headline ', () => {
  it('for single file.', () => {
    cy.mount(<DropZone id="cy-dropzone"></DropZone>);
    cy.get('#cy-dropzone').contains('Drag and Drop to Upload File');
  });

  it('for multiple files.', () => {
    cy.mount(<DropZone id="cy-dropzone" multiple></DropZone>);
    cy.get('#cy-dropzone').contains('Drag and Drop to Upload Files');
  });
});

describe('The drop zone file upload ', () => {
  beforeEach(() => {
    cy.mount(
      <DropZone
        id="cy-dropzone"
        inputId="cy-dropzone-input"
        accept=".png,.jpg,.jpeg,.gif"
      >
        Drop a JPG, PNG, or GIF for your profile picture.
      </DropZone>,
    );
    cy.get('#cy-dropzone').as('dropzone');
    cy.get('#cy-dropzone-input').as('input');
  });

  it('accepts valid drag and drop.', () => {
    cy.fixture('avatar.jpg').then(file => {
      cy.get('@dropzone').selectFile(
        {
          contents: Buffer.from(file, 'base64'),
          fileName: 'avatar.jpg',
        },
        {
          action: 'drag-drop',
          force: true,
        },
      );
    });
  });

  it('accepts valid selection.', () => {
    cy.fixture('avatar.jpg').then(file => {
      cy.get('@input').selectFile(
        {
          contents: Buffer.from(file, 'base64'),
          fileName: 'avatar.jpg',
        },
        {
          action: 'select',
          force: true,
        },
      );
    });
  });
});
