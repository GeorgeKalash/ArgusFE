const service = 'RS.asmx/'

export const RepairRepository = {
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
  PreventiveMaintenanceTasks: {
    page: service + 'pagePMT',
    get: service + 'getPMT',
    set: service + 'setPMT',
    del: service + 'delPMT'
  }
}