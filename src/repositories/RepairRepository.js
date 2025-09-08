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
  WorkOrder: {
    page: service + 'pageWO',
    get: service + 'getWO',
    set: service + 'setWO',
    del: service + 'delWO'
  }
}
