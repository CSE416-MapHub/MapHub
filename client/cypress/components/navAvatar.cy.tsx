// TODO: fix
// /// <reference types="cypress" />
// import '../support/component';
// import NavAvatar from '../../src/app/components/navAvatar';
// import mockAccountAPI from '../mock/mockAccountAPI';
// import MockAppRouterProvider from '../mock/MockAppRouterProvider';

// function setUpNavAvatar() {
//   mockAccountAPI();
//   cy.mount(
//     <MockAppRouterProvider>
//       <NavAvatar />
//     </MockAppRouterProvider>,
//   );
//   cy.get('[id*="nav-avatar"]').as('nav-avatar');
// }

// function setUpAccountMenu() {
//   setUpNavAvatar();
//   cy.get('@nav-avatar').click();
//   cy.get('#account-menu').as('account-menu');
// }
// describe('Navigation avatar ', () => {
//   beforeEach(setUpNavAvatar);

//   it('is visible.', () => {
//     cy.get('@nav-avatar').should('be.visible');
//   });

//   it('is clickable.', () => {
//     cy.get('@nav-avatar').click();
//   });
// });

// describe('Account menu ', () => {
//   beforeEach(setUpAccountMenu);

//   it('is visible.', () => {
//     cy.get('@account-menu').should('be.visible');
//   });
// });

// describe('Dashboard menu item ', () => {
//   beforeEach(() => {
//     setUpAccountMenu();
//     cy.get('#account-dashboard').as('dashboard');
//   });

//   it('is visible.', () => {
//     cy.get('@dashboard').should('be.visible');
//   });

//   it('clicks and calls router.push()', () => {
//     cy.get('@dashboard').click();
//     cy.get('@push').should('be.called');
//     cy.get('@push').should('be.calledWith', '/account/dashboard');
//   });
// });

// describe('Settings menu item ', () => {
//   beforeEach(() => {
//     setUpAccountMenu();
//     cy.get('#account-settings').as('settings');
//   });

//   it('is visible.', () => {
//     cy.get('@settings').should('be.visible');
//   });

//   it('clicks and calls router.push()', () => {
//     cy.get('@settings').click();
//     cy.get('@push').should('be.called');
//     cy.get('@push').should('be.calledWith', '/account/settings');
//   });
// });

// describe('Sign Out menu item ', () => {
//   beforeEach(() => {
//     setUpAccountMenu();
//     cy.get('#account-sign-out').as('sign-out');
//   });

//   it('is visible.', () => {
//     cy.get('@sign-out').should('be.visible');
//   });

//   it('clicks and calls router.replace()', () => {
//     cy.get('@sign-out').click();
//     cy.get('@replace').should('be.called');
//     cy.get('@replace').should('be.calledWith', '/');
//   });
// });
