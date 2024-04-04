const service = 'CA.asmx/'

export const CashBankRepository = {
  CashAccount: {
    qry: service + 'qryACC',
    get: service + 'getACC',
    snapshot: service + 'snapshotACC'
  },
  CreditCard: {
    qry: service + 'qryCC'
  },
  CbCashGroup: {
    qry: service + 'qryGRP',
    page: service + 'pageGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  },
  CbBank: {
    qry: service + 'qryBNK',
    get: service + 'getBNK',
    set: service + 'setBNK',
    del: service + 'delBNK',
    page: service + 'pageBNK'
  },
  CashTransfer: {
    qry: service + 'qryTFM',
    get: service + 'getTFM',
    set: service + 'set2TFM',
    del: service + 'delTFM',
    page: service + 'pageTFM',
    snapshot: service + 'snapshotTFM'
  },
  CurrencyTransfer: {
    qry: service + 'qryTFC'
  }
}
