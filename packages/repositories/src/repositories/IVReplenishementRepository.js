const service = 'IR.asmx/'

export const IVReplenishementRepository = {
  ReplenishmentGroups: {
    qry: service + 'qryGRP',
    page: service + 'pageGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  },
  IvReplenishements: {
    qry: service + 'qryHDR',
    page: service + 'pageHDR',
    get: service + 'getHDR',
    set: service + 'setHDR'
  },
  IvReplenishementsList: {
    qry: service + 'qryTRX'
  },
  GenerateIvReplenishements: {
    generate: service + 'generateTFR'
  },
  MaterialReplenishment: {
    page: service + 'pageREQ',
    del: service + 'delREQ',
    get: service + 'getREQ',
    set2: service + 'set2REQ',
    snapshot: service + 'snapshotREQ',
    close: service + 'closeREQ',
    reopen: service + 'reopenREQ',
    cancel: service + 'cancelREQ',
    print: service + 'printREQ'
  },
  OrderItem: {
    qry: service + 'qryREI',
    open: service + 'openREI'
  },
  MatPlanning: {
    page: service + 'pageMPL',
    del: service + 'delMPL',
    get: service + 'getMPL',
    set2: service + 'set2MPL',
    reopen: service + 'reopenMPL',
    close: service + 'closeMPL',
    qry: service + 'qryMPL',
    snapshot: service + 'snapshotMPL'
  },
  MatPlanningItem: {
    qry: service + 'qryMPI',
    append: service + 'appendMPI'
  },
  PurchaseRequest: {
    generate: service + 'generatePR'
  },
  PlantSettings: {
    get: service + 'getPLT',
    set: service + 'setPLT',
    del: service + 'delPLT'
  },
  DocumentTypeDefault: {
    get: service + 'getDTD',
    set: service + 'setDTD',
    del: service + 'delDTD',
    page: service + 'pageDTD'
  },
  materialPlaning: {
    preview: service + 'previewMRP'
  },
  Transfer: {
    generate2: service + 'generate2TFR'
  },
  ConsumptionOfTools: {
    generate: service + 'generateMFCON'
  }
}
