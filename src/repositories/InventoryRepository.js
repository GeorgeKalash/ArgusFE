const service = 'IV.asmx/'

export const InventoryRepository = {
  Item: {
    snapshot: service + 'snapshotIT',
    get: service + 'getIT'
  },
  Group: {
    qry: service + 'qryGRP'
  },
  Category: {
    qry: service + 'qryCA',
    get: service + 'getCA',
    set: service + 'setCA',
    del: service + 'delCA'
  },
  Measurement: {
    page: service + 'pageMS',
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
    del: service + 'delADJ',
    page: service + 'pageADJ'
  },
  MaterialsAdjustmentDetail: {
    qry: service + 'qryADI'
  },
  MeasurementUnit: {
    qry: service + 'qryMU',
    get: service + 'getMU',
    set: service + 'setMU',
    del: service + 'delMU'
  },
  Dimension: {
    qry: service + 'qryDI',
    get: service + 'getDI',
    set: service + 'setDI',
    del: service + 'delDI'
  },
  Metals: {
    page: service + 'pageMTL',
    get: service + 'getMTL',
    set: service + 'setMTL',
    del: service + 'delMTL'
  },
  Scrap: {
    qry: service + 'qryMTS',
    set2: service + 'set2MTS'
  }
}
