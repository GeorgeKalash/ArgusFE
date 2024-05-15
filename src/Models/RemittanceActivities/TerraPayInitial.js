const TerraPayInitial = () => {
  console.log('in js')
  
  return {
    quotation: {
      requestDate: new Date(), //HERE
      debitorMSIDSN: '', //HERE
      creditorMSIDSN: '', //  ben phone number
      creditorBankAccount: '', // ben.bankaccount is IBAN
      creditorReceivingCountry: '', //HERE
      requestAmount: '', //HERE
      requestCurrency: '', //HERE
      sendingCurrency: '', //fawzii
      receivingCurrency: '' //fawzii
    },
    transaction: {
      amount: '',
      currency: '', //receivingCurrency fawzi
      type: 'inttransfer', //FAWZI TO CHECK
      descriptionText: '',
      requestDate: new Date(),
      requestingOrganisationTransactionReference: '',
      debitorMSIDSN: '',
      creditorBankAccount: '', // ben.bankaccount is IBAN
      creditorSortCode: '0001', // Fawzi To check
      creditorBankSubCode: '',
      creditorAccounttype: 'Savings',
      senderKyc: {
        nationality: '',
        dateOfBirth: new Date(),
        gender: '',
        idDocument: [],
        postalAddress: {
          addressLine1: '',
          addressLine2: '',
          addressLine3: '',
          city: '',
          stateProvince: '',
          postalCode: '',
          country: ''
        },
        subjectName: {
          title: '',
          firstName: '',
          middleName: '',
          lastName: '',
          fullName: ''
        }
      },
      recipientKyc: {
        nationality: '',
        dateOfBirth: new Date(),
        idDocument: [],
        postalAddress: {
          addressLine1: '',
          addressLine2: '',
          addressLine3: '',
          city: '',
          stateProvince: '',
          postalCode: '',
          country: ''
        },
        subjectName: {
          title: '',
          firstName: '',
          middleName: '',
          lastName: '',
          fullName: ''
        }
      },
      internationalTransferInformation: {
        quoteId: '',
        receivingCountry: '', //HERE
        remittancePurpose: '', // resource id slack
        sourceOfFunds: '',
        relationshipSender: ''
      }
    }
  }
}

export { TerraPayInitial }
