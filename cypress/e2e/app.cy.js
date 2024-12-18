const refValue = 'REF-TEST'
const nameValue = 'NAME-TEST'
const newRef = 'REF-TEST1'
describe('Navigation', () => {
  it('should create and delete a price level', () => {
    cy.login()
    cy.visit('http://localhost:3001/price-levels/')

    cy.wait(3000)

    cy.get('.css-o2ryzj-MuiGrid-root > .MuiButtonBase-root').click({ force: true })

    // dialog should open
    cy.get('#draggable-dialog-title').should('be.visible')

    // fill the form with the currect
    cy.get('.MuiGrid-container > :nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > input').type(refValue)
    cy.get(':nth-child(2) > .MuiFormControl-root > .MuiInputBase-root > input').type(nameValue)

    // click on the save button
    cy.get(':nth-child(4) > .MuiButtonBase-root').click({ force: true })

    // close the dialog
    cy.get('#draggable-dialog-title > :nth-child(2) > [aria-label="clear input"]').click({ force: true })

    // check if the value is in the table
    cy.get('.ag-row-last > .ag-column-first > .css-0 > .MuiBox-root').contains(refValue)

    // click the edit button
    cy.get(
      '.ag-row-odd > .ag-column-last > .MuiBox-root > .css-1ccj1yy-MuiButtonBase-root-MuiIconButton-root > img'
    ).click({ force: true })

    // check dialogue is visible
    cy.get('#draggable-dialog-title > :nth-child(1) > .MuiTypography-root').should('be.visible')

    // edit || fill the form with new values

    cy.wait(2000)
    cy.get('.MuiGrid-container > :nth-child(1) > .MuiFormControl-root > .MuiInputBase-root > input').type('1')

    cy.wait(5000)

    // click on the save button
    cy.get(':nth-child(4) > .MuiButtonBase-root').click({ force: true })

    // close the dialog
    cy.get('#draggable-dialog-title > :nth-child(2) > [aria-label="clear input"]').click({ force: true })

    // check if the value is in the table
    cy.get('.ag-row-last > .ag-column-first > .css-0 > .MuiBox-root').contains(newRef)

    // click on the delete button
    cy.get('.ag-row-last > .ag-column-last > .MuiBox-root > .MuiIconButton-colorError > img').click({ force: true })

    cy.wait(500)
    cy.get('#draggable-dialog-title').should('be.visible')

    // confirm the delete
    cy.get('.css-y29spn > .MuiButtonBase-root').click({ force: true })

    // check if the value is not in the table
    cy.get('.ag-row-last > .ag-column-first > .css-0 > .MuiBox-root').should('not.contain', refValue)
    cy.get('.ag-row-last > [col-id="name"] > .css-0 > .MuiBox-root').should('not.contain', nameValue)
  })
})
