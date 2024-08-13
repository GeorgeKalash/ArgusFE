const service = 'PU.asmx/'

export const PurchaseRepository = {
  VendorGroups: {
    qry: service + 'qryGRP',
    page: service + 'pageGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  },
  DeliveryMethods: {
    qry: service + 'qryDM',
    page: service + 'pageDM',
    get: service + 'getDM',
    set: service + 'setDM',
    del: service + 'delDM'
  },
  PaymentTerms: {
    qry: service + 'qryPT',
    page: service + 'pagePT',
    get: service + 'getPT',
    set: service + 'setPT',
    del: service + 'delPT'
  },
  Vendor: {
    snapshot: service + 'snapshotVEN',
    qry: service + 'qryVEN',
    page: service + 'pageVEN',
    get: service + 'getVEN',
    set: service + 'setVEN',
    del: service + 'delVEN'
  },
  Address: {
    qry: service + 'qryAD',
    page: service + 'pageAD',
    get: service + 'getAD',
    set: service + 'setAD',
    del: service + 'delAD'
  }
}
