describe('Max Access', () => {
  it('should disable a field in credit order form', () => {
    const category = 'Currency Trading'
    const id = '35301'
    const disabled = 'Disabled'
    cy.login()

    cy.visit('http://localhost:3001/global-authorization/')

    cy.wait(3000)

    cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').click()
    cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').clear()
    cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(category)
    cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('{downarrow}')
    cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('{enter}')

    cy.get('.MuiGrid-container > :nth-child(3) > .MuiFormControl-root').click()
    cy.get('.MuiGrid-container > :nth-child(3) > .MuiFormControl-root').type(id)
    cy.get('.MuiGrid-container > :nth-child(3) > .MuiFormControl-root').type('{enter}')

    cy.get('.ag-column-last > .MuiBox-root > .MuiButtonBase-root').click()

    cy.get('[row-index="1"] > .ag-column-last').click()
    cy.get('[row-index="1"] > .ag-column-last').type(disabled)
    cy.get('[row-index="1"] > .ag-column-last').type('{downarrow}')
    cy.get('[row-index="1"] > .ag-column-last').type('{enter}')

    cy.get('.button-container > .MuiButtonBase-root').click()

    cy.wait(1000)

    cy.visit('http://localhost:3001/credit-order/')

    cy.wait(3000)

    cy.get('.css-o2ryzj-MuiGrid-root > .MuiButtonBase-root').click()

    cy.get(':nth-child(2) > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root')
      .find('input')
      .should('be.disabled')

    cy.visit('http://localhost:3001/global-authorization/')

    cy.wait(3000)

    cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').click()
    cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').clear()
    cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type(category)
    cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('{downarrow}')
    cy.get('.MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root').type('{enter}')

    cy.get('.MuiGrid-container > :nth-child(3) > .MuiFormControl-root').click()
    cy.get('.MuiGrid-container > :nth-child(3) > .MuiFormControl-root').type(id)
    cy.get('.MuiGrid-container > :nth-child(3) > .MuiFormControl-root').type('{enter}')

    cy.get('.ag-column-last > .MuiBox-root > .MuiButtonBase-root').click()

    cy.get('[row-index="1"] > .ag-column-last').click()
    cy.get(
      '.MuiBox-root > .MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root > .MuiAutocomplete-endAdornment > .MuiAutocomplete-clearIndicator'
    ).click()

    cy.get('.button-container > .MuiButtonBase-root').click()
  })
})
