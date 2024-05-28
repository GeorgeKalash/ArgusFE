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
  CATransaction: {
    page: service + 'pageTRX'
  }
}
