const service = 'RS.asmx/'

export const RepairAndServiceRepository = {
  RepairName: {
    page: service + 'pageRNA',
    qry: service + 'qryRNA',
    get: service + 'getRNA',
    set: service + 'setRNA',
    del: service + 'delRNA'
  },
  WorkOrderTypes: {
    page: service + 'pageWOT',
    qry: service + 'qryWOT',
    get: service + 'getWOT',
    set: service + 'setWOT',
    del: service + 'delWOT'
  },
  RepairType: {
    page: service + 'pageRT',
    get: service + 'getRT',
    set: service + 'setRT',
    del: service + 'delRT'
  },
  SpareParts: {
    snapshot: service + 'snapshotSP',
    page: service + 'pageSP',
    get: service + 'getSP',
    set: service + 'setSP',
    del: service + 'delSP'
  },
  InspectionTemplate: {
    get2: service + 'get2ITE',
    page: service + 'pageITE',
    set2: service + 'set2ITE',
    del: service + 'delITE'
  },
  Department: {
    page: service + 'pageDEP',
    get: service + 'getDEP',
    set: service + 'setDEP',
    del: service + 'delDEP'
  },
  Warehouse: {
    page: service + 'pageWH',
    qry: service + 'qryWH',
    set: service + 'setWH',
    get: service + 'getWH',
    del: service + 'delWH'
  },
  PreventiveMaintenanceTasks: {
    qry: service + 'qryPMT',
    page: service + 'pagePMT',
    qry: service + 'qryPMT',
    get: service + 'getPMT',
    set: service + 'setPMT',
    del: service + 'delPMT'
  },
  Equipment: {
    qry: service + 'qryEQP',
    page: service + 'pageEQP',
    get: service + 'getEQP',
    set: service + 'setEQP',
    del: service + 'delEQP',
    snapshot: service + 'snapshotEQP'
  },
  SpManufacturer: {
    page: service + 'pageSPM',
    get: service + 'getSPM',
    set: service + 'setSPM',
    del: service + 'delSPM',
    qry: service + 'qrySPM'
  },
  JobPosition: {
    page: service + 'pagePOS',
    qry: service + 'qryPOS',
    get: service + 'getPOS',
    set: service + 'setPOS',
    del: service + 'delPOS'
  },
  SpCategory: {
    page: service + 'pageSPC',
    get: service + 'getSPC',
    set: service + 'setSPC',
    del: service + 'delSPC',
    qry: service + 'qrySPC'
  },
  MaintenanceTemplates: {
    page: service + 'pageMTE',
    get: service + 'getMTE',
    set: service + 'setMTE',
    del: service + 'delMTE',
    qry: service + 'qryMTE'
  },
  MaintenanceTemplateTask: {
    qry: service + 'qryMTT',
    get: service + 'getMTT',
    set: service + 'setMTT',
    del: service + 'delMTT'
  },
  RsLabors: {
    qry: service + 'qryLBR',
    snapshot: service + 'snapshotLBR',
    page: service + 'pageLBR',
    set: service + 'setLBR',
    get: service + 'getLBR',
    del: service + 'delLBR',
    qry: service + 'qryLBR'
  },
  WorkOrder: {
    page: service + 'qryWO',
    get: service + 'getWO',
    set: service + 'setWO',
    del: service + 'delWO',
    post: service + 'postWO'
  },
  WorkTask: {
    qry: service + 'qryWTK',
    get: service + 'getWTK',
    set: service + 'setWTK',
    del: service + 'delWTK'
  },
  EquipmentType: {
    qry: service + 'qryEQT',
    get: service + 'getEQT',
    set: service + 'setEQT',
    del: service + 'delEQT'
  },
  WorkOrderParts: {
    qry: service + 'qryWOP',
    set2: service + 'set2WOP'
  },
  WorkOrderLabors: {
    qry: service + 'qryWOL',
    set2: service + 'set2WOL'
  },
  RepairRequest: {
    page: service + 'pageREQ',
    get: service + 'getREQ',
    set: service + 'setREQ',
    del: service + 'delREQ'
  },
  Employee: {
    snapshot: service + 'snapshotEMP'
  },
  RepairType: {
    qry: service + 'qryRT'
  }
}
