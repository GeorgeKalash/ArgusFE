const service = 'CA.asmx/'

export const CashBankRepository = {

  CashAccount: {
    qry: service + 'qryACC',
    get : service + 'getACC',
    snapshot : service + 'snapshotACC',
  },
  CreditCard :{
    qry: service + 'qryCC',
  },
  CbBank:{
    qry: service + 'qryBNK',
    get: service + 'getBNK',
    set: service + 'setBNK',
    del: service + 'delBNK',
    page: service + 'pageBNK'
  }
}
