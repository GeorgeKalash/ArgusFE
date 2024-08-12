const service = 'PU.asmx/'

export const PurchaseRepository = {
  VendorGroups: {
    qry: service + 'qryGRP',
    page: service + 'pageGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  },
  PUOrderStatus: {
    qry: service + 'qryPOS',
    page: service + 'pagePOS',
    get: service + 'getPOS',
    set: service + 'setPOS',
    del: service + 'delPOS'
  },
  PaymentTerms: {
    qry: service + 'qryPT',
    page: service + 'pagePT',
    get: service + 'getPT',
    set: service + 'setPT',
    del: service + 'delPT'
  }
}
