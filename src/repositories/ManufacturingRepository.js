const service = 'MF.asmx/'

export const ManufacturingRepository = {
  LaborGroup: {
    snapshot: service + 'snapshotLBG',
    page: service + 'pageLBG',
    qry: service + 'qryLBG',
    set: service + 'setLBG',
    get: service + 'getLBG',
    del: service + 'delLBG'
  },
  ProductionLine: {
    page: service + 'pageLIN',
    qry: service + 'qryLIN',
    set: service + 'setLIN',
    get: service + 'getLIN',
    del: service + 'delLIN'
  },
  CostGroup: {
    qry: service + 'qryCG'
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
    snapshot: service + 'snapshotOPR',
    qry: service + 'qryOPR',
    page: service + 'pageOPR',
    set: service + 'setOPR',
    get: service + 'getOPR',
    del: service + 'delOPR',
    qry: service + 'qryOPR'
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
  },
  LeanProductionPlanning: {
    preview: service + 'previewLEAN',
    update: service + 'updateLEAN',
    del: service + 'delLEAN'
  },
  MaterialsAdjustment: {
    generate: service + 'generateADJ'
  },
  ProductionClass: {
    page: service + 'pageCLS',
    qry: service + 'qryCLS',
    set: service + 'setCLS',
    get: service + 'getCLS',
    del: service + 'delCLS',
    snapshot: service + 'qryCLS'
  },
  ProductionStandard: {
    qry: service + 'qrySTD'
  },
  ProductionClassSemiFinished: {
    qry: service + 'qryCSF',
    set: service + 'setCSF',
    get: service + 'getCSF',
    del: service + 'delCSF',
    set2: service + 'set2CSF'
  },
  RoutingSequence: {
    set2: service + 'set2RTS', //RoutingSequencePack
    qry: service + 'qryRTS'
  },
  Overhead: {
    qry: service + 'qryOVH',
    set: service + 'setOVH',
    get: service + 'getOVH',
    del: service + 'delOVH',
    snapshot: service + 'snapshotOVH'
  },
  Design: {
    qry: service + 'qryDES',
    set: service + 'setDES',
    get: service + 'getDES',
    del: service + 'delDES',
    snapshot: service + 'snapshotDES'
  },
  MFJobOrder: {
    qry: service + 'qryJOB',
    set: service + 'setJOB',
    get: service + 'getJOB',
    del: service + 'delJOB',
    snapshot: service + 'snapshotJOB'
  }
}
