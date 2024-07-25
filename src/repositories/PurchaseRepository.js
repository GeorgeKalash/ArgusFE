const service = 'PU.asmx/'

export const PurchaseRepository = {
  PriceList: {
    qry: service + 'qryPRI',
    del: service + 'delPRI',
    get: service + 'getPRI',
    set: service + 'setPRI'
  },
  Vendor: {
    snapshot: service + 'snapshotVEN'
  }
}
