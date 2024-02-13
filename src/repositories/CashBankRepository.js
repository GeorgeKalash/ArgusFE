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
  CbCashGroup:{
    qry: service + 'qryGRP',
    page: service + 'pageGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  }
}
