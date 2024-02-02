const service = 'MF.asmx/'

export const ManufacturingRepository = {
  LaborGroup: {
    snapshot: service + 'snapshotLBG',
    page: service + 'pageLBG',
    set: service + 'setLBG',
    get: service + 'getLBG',
    del: service + 'delLGB'
  },
  ProductionLine: {
    page: service + 'pageLIN',
    qry: service + 'qryLIN',
    set: service + 'setLIN',
    get: service + 'getLIN',
    del: service + 'delLIN'
  },
  WorkCenter: {
    page: service + 'pageWCT',
    qry: service + 'qryWCT',
    set: service + 'setWCT',
    get: service + 'getWCT',
    del: service + 'delWCT'
  },
  Routing: {
    page: service + 'pageRTN',
    qry: service + 'qryRTN',
    set: service + 'setRTN',
    get: service + 'getRTN',
    del: service + 'delRTN'
  },
  LeanProductionPlanning: {
    preview: service + 'previewLEAN'
  },
  MaterialsAdjustment: {
    generate: service + 'generateADJ'
  }
}
