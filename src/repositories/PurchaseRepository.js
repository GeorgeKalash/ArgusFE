const service = 'PU.asmx/'

export const PurchaseRepository = {
  VendorGroup: {
    qry: service + 'qryGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  },
  Vendor: {
    qry: service + 'qryVEN',
    get: service + 'getVEN',
    set: service + 'setVEN',
    del: service + 'delVEN',
    snapshot: service + 'snapshotVEN'
  },
  PurchaseInvoiceHeader: {
    qry: service + 'qryIVC',
    get: service + 'getIVC',
    set: service + 'setIVC',
    del: service + 'delIVC',
    snapshot: service + 'snapshotIVC'
  }
}
