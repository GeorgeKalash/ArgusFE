const service = 'CTTRX.asmx/'

export const CTTRXrepository = {
  CurrencyTrading: {
    snapshot: service + 'snapshotCIV'
  },
  CreditOrder: {
    qry: service + 'qryORD',
    get: service + 'getORD',
    del: service + 'delORD',
    snapshot: service + 'snapshotORD',
    set: service + 'set2ORD',
    close: service + 'closeORD'
  },
  CreditOrderItem: {
    qry: service + 'qryORI'
  }
}
