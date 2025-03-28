const service = 'MF.asmx/'

export const ManufacturingRepository = {
  DesignRawMaterial: { qry2: service + 'qryDRM2' },
  IssueOfMaterialsItems: { qry: service + 'qryIMI' },
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
    qry2: service + 'qry2LIN',
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
    del: service + 'delWCT',
    snapshot: service + 'snapshotWCT'
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
    del: service + 'delOPR'
  },
  Labor: {
    page: service + 'pageLBR',
    qry: service + 'qryLBR',
    set: service + 'setLBR',
    get: service + 'getLBR',
    del: service + 'delLBR',
    snapshot: service + 'snapshotLBR'
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
    preview: service + 'previewPQ',
    update: service + 'updatePQ',
    snapshot: service + 'snapshotPQ',
    del: service + 'delPQ',
    cancel: service + 'cancelPQ'
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
    snapshot: service + 'snapshotJOB',
    snapshot2: service + 'snapshotJOB2',
    cancel: service + 'cancelJOB',
    post: service + 'postJOB',
    start: service + 'startJOB',
    stop: service + 'stopJOB'
  },
  ProductionSheet: {
    page: service + 'pagePST',
    qry: service + 'qryPST',
    get: service + 'getPST',
    set2: service + 'set2PST',
    get2: service + 'get2PST',
    del: service + 'delPST',
    post: service + 'postPST',
    unpost: service + 'unpostPST',
    snapshot: service + 'snapshotPST'
  },
  ProductionSheetItem: {
    qry: service + 'qryPSI',
    set: service + 'setPSI',
    get: service + 'getPSI',
    del: service + 'delPSI'
  },
  DocumentTypeDefault: {
    qry: service + 'qryDTD',
    get: service + 'getDTD',
    set: service + 'setDTD',
    del: service + 'delDTD',
    page: service + 'pageDTD'
  },
  RawMaterialCategory: {
    qry: service + 'qryRMC',
    get: service + 'getRMC',
    set: service + 'setRMC',
    del: service + 'delRMC',
    page: service + 'pageRMC'
  },
  Worksheet: {
    snapshot: service + 'snapshotWST',
    get: service + 'getWST',
    set: service + 'setWST',
    del: service + 'delWST',
    page: service + 'pageWST',
    summary: service + 'summaryWST',
    post: service + 'postWST'
  },
  WorksheetMaterials: {
    qry: service + 'qryIMA',
    get: service + 'getIMA',
    set: service + 'setIMA',
    set2: service + 'set2IMA',
    del: service + 'delIMA',
    post: service + 'postIMA'
  },
  ProductionSheetQueue: {
    qry: service + 'qryPSQ'
  },
  Damage: {
    qry: service + 'qryDMG',
    get: service + 'getDMG',
    set: service + 'setDMG',
    del: service + 'delDMG',
    page: service + 'pageDMG',
    snapshot: service + 'snapshotDMG',
    post: service + 'postDMG'
  },
  JobCategory: {
    qry: service + 'qryJCA'
  },
  JobRouting: {
    qry: service + 'qryJRO',
    get: service + 'getJRO',
    set: service + 'setJRO',
    set2: service + 'set2JRO',
    del: service + 'delJRO'
  },
  Worksheet: {
    snapshot: service + 'snapshotWST',
    get: service + 'getWST',
    set: service + 'setWST',
    del: service + 'delWST',
    page: service + 'pageWST',
    summary: service + 'summaryWST',
    post: service + 'postWST',
    qry2: service + 'qryWST2'
  },
  JobOverhead: {
    qry: service + 'qryJOH',
    set2: service + 'set2JOH',
    generate: service + 'generateJOH'
  },
  JobMaterial: {
    qry: service + 'qryJMA'
  },
  JobItemSize: {
    qry: service + 'qryJSZ',
    set2: service + 'set2JSZ'
  },
  MFSerial: {
    qry: service + 'qrySRL',
    set2: service + 'set2SRL',
    generate: service + 'generateSRL'
  },
  SamplePack: {
    qry: service + 'qrySPL',
    set2: service + 'set2SPL'
  },
  DamageReturn: {
    get: service + 'getDMR',
    set: service + 'setDMR',
    del: service + 'delDMR',
    page: service + 'pageDMR',
    snapshot: service + 'snapshotDMR',
    post: service + 'postDMR'
  },
  ProductionOrder: {
    get: service + 'getPO',
    get2: service + 'get2PO',
    qry: service + 'qryPO',
    set: service + 'setPO',
    set2: service + 'set2PO',
    del: service + 'delPO',
    page: service + 'pagePO',
    snapshot: service + 'snapshotPO',
    post: service + 'postPO'
  },
  ProductionOrderDetail: {
    qry: service + 'qryPOI'
  },
}
