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
  SpareParts: {
    page: service + 'pageSP',
    get: service + 'getSP',
    set: service + 'setSP',
    del: service + 'delSP'
  },
  SparePartsCategory: {
    qry: service + 'qrySPC'
  },
  Manufacturer: {
    qry: service + 'qrySPM'
  },
  Warehouse: {
    page: service + 'pageWH',
    set: service + 'setWH',
    get: service + 'getWH',
    del: service + 'delWH'
  }
}
