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
  JobPosition: {
    page: service + 'pagePOS',
    get: service + 'getPOS',
    set: service + 'setPOS',
    del: service + 'delPOS'
  }
}
