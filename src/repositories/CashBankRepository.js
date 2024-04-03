const service = 'CA.asmx/'

export const CashBankRepository = {

  CashAccount: {
    qry: service + 'qryACC',
    get : service + 'getACC',
    del : service + 'delACC',
    snapshot : service + 'snapshotACC'
  },
  CashBox:{
    set : service + 'setCBX'
  },
  CreditCard :{
    qry: service + 'qryCC',
  },
  CbCashGroup:{
    qry: service + 'qryGRP',
    page: service + 'pageGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  },
  CbBank:{
    qry: service + 'qryBNK',
    get: service + 'getBNK',
    set: service + 'setBNK',
    del: service + 'delBNK',
    page: service + 'pageBNK'
  }
}
