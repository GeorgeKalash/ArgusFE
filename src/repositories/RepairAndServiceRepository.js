const service = 'RS.asmx/'

export const RepairAndServiceRepository = {
  RepairName: {
    page: service + 'pageRNA',
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
  Department: {
    page: service + 'pageDEP',
    get: service + 'getDEP',
    set: service + 'setDEP',
    del: service + 'delDEP'
  },
  Warehouse: {
    page: service + 'pageWH',
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
  WorkOrder: {
    page: service + 'qryWO',
    get: service + 'getWO',
    set: service + 'setWO',
    del: service + 'delWO'
  },
  Equipment: {
    snapshot: service + 'snapshotEQP'
  },
  WorkTask: {
    qry: service + 'qryWTK'
  },
  MaintenanceTemplateTask: {
    qry: service + 'qryMTT',
    get: service + 'getMTT',
    set: service + 'setMTT',
    del: service + 'delMTT'
  }
}
