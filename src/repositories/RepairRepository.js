const service = 'RS.asmx/'

export const RepairRepository = {
  WorkOrderTypes: {
    page: service + 'pageWOT',
    get: service + 'getWOT',
    set: service + 'setWOT',
    del: service + 'delWOT',
  }
}