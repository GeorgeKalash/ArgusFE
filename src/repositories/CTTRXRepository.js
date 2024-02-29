const service = 'CTTRX.asmx/'

export const CTTRXrepository = {
  CurrencyTrading: {
    snapshot: service + 'snapshotCIV'
  },
  CreditOrder: {
    page: service + 'pageORD',
    qry: service + 'qryORD',
    get: service + 'getORD',
    del: service + 'delORD',
    snapshot: service + 'snapshotORD',
    set: service + 'set2ORD',
    close: service + 'closeORD'
  },
  CreditOrderItem: {
    qry: service + 'qryORI'
  },
  UndeliveredCreditOrder: {
    page: service + 'pageORD2',
    qry: service + 'qryORD2',
    snapshot: service + 'snapshotORD2'
  }
}
