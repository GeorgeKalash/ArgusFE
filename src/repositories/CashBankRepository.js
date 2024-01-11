const service = 'CA.asmx/'

export const CashBankRepository = {

  CashAccount: {
    get : service + 'getACC',
    snapshot : service + 'snapshotACC',
  },

}
