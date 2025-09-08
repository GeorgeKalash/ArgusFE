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
  }
}
