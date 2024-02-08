const service = 'IV.asmx/'

export const InventoryRepository = {
  Item: {
    snapshot: service + 'snapshotIT'
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
    del: service + 'delSI'
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
  }
}
