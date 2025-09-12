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
  Warehouse: {
    page: service + 'pageWH',
    set: service + 'setWH',
    get: service + 'getWH',
    del: service + 'delWH'
  },
  PreventiveMaintenanceTasks: {
    qry: service + 'qryPMT',
    page: service + 'pagePMT',
    get: service + 'getPMT',
    set: service + 'setPMT',
    del: service + 'delPMT'
  },
  Equipment: {
    qry: service + 'qryEQP',
    page: service + 'pageEQP',
    get: service + 'getEQP',
    set: service + 'setEQP',
    del: service + 'delEQP'
  },
  Maintenance: {
    qry: service + 'qryMTE'
  },
  Labor: {
    qry: service + 'qryLBR'
  },
  EquipmentTask: {
    qry: service + 'qryEQT',
    get: service + 'getEQT',
    set: service + 'setEQT',
    del: service + 'delEQT'
  }
}
