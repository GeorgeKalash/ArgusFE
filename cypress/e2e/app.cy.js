describe('Navigation', () => {
  it('should login in successfully', () => {
    cy.login()
    cy.intercept('GET', 'https://deploy.arguserp.net/KVS.asmx/qryLBL?_dataset=51101').as('SA')
    cy.visit('http://localhost:3001/price-levels/')

    cy.wait(3000)

    cy.get('.css-o2ryzj-MuiGrid-root > .MuiButtonBase-root').click({ force: true })
  })
})
