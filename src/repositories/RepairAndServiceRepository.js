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
    page: service + 'pagePMT',
    qry: service + 'qryPMT',
    get: service + 'getPMT',
    set: service + 'setPMT',
    del: service + 'delPMT'
  },
  SpManufacturer: {
    page: service + 'pageSPM',
    get: service + 'getSPM',
    set: service + 'setSPM',
    del: service + 'delSPM'
  },
  JobPosition: {
    page: service + 'pagePOS',
    get: service + 'getPOS',
    set: service + 'setPOS',
    del: service + 'delPOS'
  },
  SpCategory: {
    page: service + 'pageSPC',
    get: service + 'getSPC',
    set: service + 'setSPC',
    del: service + 'delSPC'
  },
  WorkOrder: {
    page: service + 'qryWO',
    get: service + 'getWO',
    set: service + 'setWO',
    del: service + 'delWO',
    post: service + 'postWO'
  },
  Equipment: {
    snapshot: service + 'snapshotEQP'
  },
  WorkTask: {
    qry: service + 'qryWTK',
    get: service + 'getWTK',
    set: service + 'setWTK',
    del: service + 'delWTK'
  },
  MaintenanceTemplateTask: {
    qry: service + 'qryMTT',
    get: service + 'getMTT',
    set: service + 'setMTT',
    del: service + 'delMTT'
  },
  EquipmentType: {
    qry: service + 'qryEQT'
  },
  WorkOrderParts: {
    qry: service + 'qryWOP',
    set2: service + 'set2WOP'
  },
  Part: {
    snapshot: service + 'snapshotSP'
  },
  Labor: {
    snapshot: service + 'snapshotLBR'
  },
  WorkOrderLabors: {
    qry: service + 'qryWOL',
    set2: service + 'set2WOL'
  }
}
