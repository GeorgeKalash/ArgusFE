const service = 'RS.asmx/'

export const RepairAndServiceRepository = {
  Warehouse: {
    page: service + 'pageWH',
    set: service + 'setWH',
    get: service + 'getWH',
    del: service + 'delWH'
  }
}
