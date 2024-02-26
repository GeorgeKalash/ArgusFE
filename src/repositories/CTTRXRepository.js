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
  },
  UndeliveredCreditOrder: {
    qry: service + 'qryORD2',
    snapshot: service + 'snapshotORD2'
  },
  CreditInvoice: {
    qry: service + 'qryINV',
    get: service + 'getINV',
    del: service + 'delINV',
    snapshot: service + 'snapshotINV',
    set: service + 'set2INV',
    close: service + 'closeINV'
  },
  CreditInvoiceItem: {
    qry: service + 'qryINI'
  }
}
