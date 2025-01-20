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
  },
  RetailInvoice: {
    qry: service + 'qryIVC',
    del: service + 'delIVC',
    get: service + 'getIVC',
    get2: service + 'get2IVC',
    snapshot: service + 'snapshotIVC',
    level: service + 'level2_IVC',
    set2: service + 'set2IVC',
    post: service + 'postIVC',
    unpost: service + 'unpostIVC'
  },
  RetailPurchase: {
    set2: service + 'set2IVP'
  },
  RetailReturn: {
    set2: service + 'set2IVR'
  },
  PUItems: {
    snapshot: service + 'snapshotIT'
  }
}
