const service = 'PS.asmx/'

export const PointofSaleRepository = {
  PosUsers: {
    qry: service + 'qryUSR',
    get: service + 'getUSR',
    set: service + 'setUSR',
    del: service + 'delUSR',
    page: service + 'pageUSR',
    set2: service + 'set2USR'
  },

  PointOfSales: {
    page: service + 'pagePOS',
    qry: service + 'qryPOS',
    get: service + 'getPOS',
    set: service + 'setPOS',
    del: service + 'delPOS'
  },
  SalesPerson: {
    qry: service + 'qrySP',
    set2: service + 'set2SP'
  },
  CashAccount: {
    qry: service + 'qryCA',
    set2: service + 'set2CA'
  },
  DocumentTypeDefault: {
    qry: service + 'qryDTD',
    get: service + 'getDTD',
    set: service + 'setDTD',
    del: service + 'delDTD'
  }
}
