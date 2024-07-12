const service = 'IV.asmx/'

export const InventoryRepository = {
  Item: {
    snapshot: service + 'snapshotIT',
    get: service + 'getIT'
  },
  Category: {
    qry: service + 'qryCA',
    get: service + 'getCA',
    set: service + 'setCA',
    del: service + 'delCA'
  },
  Measurement: {
    qry: service + 'qryMS',
    get: service + 'getMS',
    set: service + 'setMS',
    del: service + 'delMS'
  },
  Site: {
    qry: service + 'qrySI',
    get: service + 'getSI',
    set: service + 'setSI',
    del: service + 'delSI',
    page: service + 'pageSI',
    snapshot: service + 'snapshotSI'
  },

  SiteGroups: {
    qry: service + 'qrySGP',
    get: service + 'getSGP',
    set: service + 'setSGP',
    del: service + 'delSGP'
  },
  SiteGroups: {
    qry: service + 'qrySGP',
    get: service + 'getSGP',
    set: service + 'setSGP',
    del: service + 'delSGP',
    snapshot: service + 'snapshotSGP'
  },
  MaterialsAdjustment: {
    qry: service + 'qryADJ',
    get: service + 'getADJ',
    set: service + 'setADJ',
    set2: service + 'set2ADJ',
    post: service + 'postADJ',
    unpost: service + 'unpostADJ',
    del: service + 'delADJ'
  },
  MaterialsAdjustmentDetail: {
    qry: service + 'qryADI'
  },
  Items: {
    pack: service + 'packIT',
    page: service + 'pageIT',
    qry: service + 'qryIT',
    get: service + 'getIT',
    set: service + 'setIT',
    del: service + 'delIT',
    snapshot: service + 'snapshotIT'
  }
}
