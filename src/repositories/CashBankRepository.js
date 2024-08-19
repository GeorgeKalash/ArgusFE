const service = 'CA.asmx/'

export const CashBankRepository = {
  CashAccount: {
    qry: service + 'qryACC',
    get: service + 'getACC',
    del: service + 'delACC',
    snapshot: service + 'snapshotACC'
  },
  CashBox: {
    set: service + 'setCBX'
  },
  CreditCard: {
    qry: service + 'qryCC'
  },
  CashTransaction: {
    qry: service + 'qryTRX'
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
    qry2: service + 'qryBNK2',
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
    snapshot: service + 'snapshotTFM',
    close: service + 'closeTFM',
    reopen: service + 'reopenTFM',
    post: service + 'postTFM'
  },
  CurrencyTransfer: {
    qry: service + 'qryTFC'
  },
  CbBankAccounts: {
    qry: service + 'qryACC',
    get: service + 'getACC',
    set: service + 'setBAC',
    del: service + 'delACC',
    snapshot: service + 'snapshotACC'
  },
  AccountBalance: {
    qry: service + 'qryABA',
    get: service + 'getABA',
    rebuild: service + 'rebuildABA'
  },

  OpeningBalance: {
    qry: service + 'qryOBA',
    get: service + 'getOBA',
    set: service + 'setOBA',
    del: service + 'delOBA',
    page: service + 'pageOBA'
  },

  CATransaction: {
    page: service + 'pageTRX'
  },
  CAadjustment: {
    qry: service + 'qryADJ',
    page: service + 'pageADJ',
    get: service + 'getADJ',
    set: service + 'setADJ',
    del: service + 'delADJ',
    post: service + 'postADJ'
  },
  CACheckbook: {
    qry: service + 'qryCBK',
    page: service + 'pageCBK',
    get: service + 'getCBK',
    set: service + 'setCBK',
    del: service + 'delCBK',
  }
}
