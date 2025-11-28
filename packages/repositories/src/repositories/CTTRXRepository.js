const service = 'CTTRX.asmx/'

export const CTTRXrepository = {
  CurrencyTrading: {
    get2: service + 'get2CIV',
    get3: service + 'get3CIV',
    set2: service + 'set2CIV',
    snapshot: service + 'snapshotCIV',
    close: service + 'closeCIV',
    reopen: service + 'reopenCIV',
    post: service + 'postCIV'
  },
  CreditOrder: {
    page: service + 'pageORD',
    qry: service + 'qryORD',
    get: service + 'getORD',
    del: service + 'delORD',
    snapshot: service + 'snapshotORD',
    set: service + 'set2ORD',
    close: service + 'closeORD',
    reopen: service + 'reopenORD',
    tfr: service + 'transfer2ORD'
  },
  CreditOrderItem: {
    qry: service + 'qryORI'
  },
  UndeliveredCreditOrder: {
    page: service + 'pageORD2',
    qry: service + 'qryORD2',
    snapshot: service + 'snapshotORD2'
  },
  CreditInvoice: {
    page: service + 'pageIVC',
    qry: service + 'qryIVC',
    get: service + 'getIVC',
    del: service + 'delIVC',
    snapshot: service + 'snapshotIVC',
    set: service + 'set2IVC',
    close: service + 'closeIVC',
    post: service + 'postIVC',
    cancel: service + 'cancelIVC'
  },
  CreditInvoiceItem: {
    qry: service + 'qryIVI'
  },
  CashCount: {
    qry: service + 'qryTRX'
  }
}
