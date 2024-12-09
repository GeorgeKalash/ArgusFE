// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('login', (email = 'Hassan.Kourani@softMachine.co', password = '12345') => {
  cy.visit('http://localhost:3001/')

  cy.get(':nth-child(2) > .MuiFormControl-root > .MuiInputBase-root > input').click({ force: true }).type(email)

  cy.get(':nth-child(3) > .MuiFormControl-root > .MuiInputBase-root > input').click({ force: true }).type(password)

  cy.get('.MuiButton-root').click({ force: true })

  cy.get('.css-5k1n1y > img').should('be.visible')
})
