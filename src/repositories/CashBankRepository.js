const service = 'CA.asmx/'

export const CashBankRepository = {

  CashAccount: {
    qry: service + 'qryACC',
    get : service + 'getACC',
    snapshot : service + 'snapshotACC',
  },
  CreditCard :{
    qry: service + 'qryCC',
  }
}
