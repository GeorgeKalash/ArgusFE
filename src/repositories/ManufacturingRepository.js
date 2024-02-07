const service = 'MF.asmx/'

export const ManufacturingRepository = {
  LaborGroup: {
    snapshot: service + 'snapshotLBG',
    page: service + 'pageLBG',
    set: service + 'setLBG',
    get: service + 'getLBG',
    del: service + 'delLGB'
  },
  ProductionLine: {
    page: service + 'pageLIN',
    qry: service + 'qryLIN',
    set: service + 'setLIN',
    get: service + 'getLIN',
    del: service + 'delLIN'
  },
  WorkCenter: {
    page: service + 'pageWCT',
    qry: service + 'qryWCT',
    set: service + 'setWCT',
    get: service + 'getWCT',
    del: service + 'delWCT'
  },
  Routing: {
    page: service + 'pageRTN',
    qry: service + 'qryRTN',
    set: service + 'setRTN',
    get: service + 'getRTN',
    del: service + 'delRTN'
  },
  Operation: {
    snapshot : service + "snapshotOPR",
    page : service + "pageOPR",
    set: service + 'setOPR',
    get: service + 'getOPR',
    del: service + 'delOPR',
    qry: service + 'qryOPR',
  },
  Labor: {
    page: service + 'pageLBR',
    qry: service + 'qryLBR',
    set: service + 'setLBR',
    get: service + 'getLBR',
    del: service + 'delLBR'
  },
  Machine: {
    page: service + 'pageMAC',
    qry: service + 'qryMAC',
    set: service + 'setMAC',
    get: service + 'getMAC',
    del: service + 'delMAC'
  },
  MachineSpecification: {
    page: service + 'pageMAS',
    qry: service + 'qryMAS',
    set: service + 'setMAS',
    get: service + 'getMAS',
    del: service + 'delMAS'
  }
}
