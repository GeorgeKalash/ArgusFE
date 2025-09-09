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
    set: service + 'setWH',
    get: service + 'getWH',
    del: service + 'delWH'
  },
  PreventiveMaintenanceTasks: {
    page: service + 'pagePMT',
    get: service + 'getPMT',
    set: service + 'setPMT',
    del: service + 'delPMT'
  }
}
