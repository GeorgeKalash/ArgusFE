const TerraPayInitial = () => {
  return {
    quotation: {
      requestDate: new Date(),
      debitorMSIDSN: '', //HERE
      creditorMSIDSN: '', //  ben phone number
      creditorBankAccount: '', // ben.bankaccount is IBAN
      creditorReceivingCountry: '',
      requestAmount: '', //HERE
      requestCurrency: '',
      sendingCurrency: '',
      receivingCurrency: ''
    },
    transaction: {
      amount: '', //HERE
      currency: '',
      type: 'inttransfer', //FAWZI TO CHECK
      descriptionText: '',
      requestDate: new Date(),
      requestingOrganisationTransactionReference: '',
      debitorMSIDSN: '', //HERE
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
        receivingCountry: '',
        remittancePurpose: '',
        sourceOfFunds: '',
        relationshipSender: ''
      }
    }
  }
}

export { TerraPayInitial }
