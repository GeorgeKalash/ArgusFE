const service = 'MF.asmx/'

export const ManufacturingRepository = {
  DesignRawMaterial: {
    qry2: service + 'qryDRM2',
    qry: service + 'qryDRM',
    set2: service + 'set2DRM'
  },
  JobOrdersItem: { qry: service + 'qryJIT', set2: service + 'set2JIT' },
  IssueOfMaterialsItems: { qry: service + 'qryIMI', qry2: service + 'qryIMI2' },
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
    qry3: service + 'qry3LIN',
    set: service + 'setLIN',
    get: service + 'getLIN',
    del: service + 'delLIN'
  },
  CostGroup: {
    page: service + 'pageCG',
    set: service + 'setCG',
    get: service + 'getCG',
    del: service + 'delCG',
    qry: service + 'qryCG'
  },
  WorkCenter: {
    page: service + 'pageWCT',
    qry: service + 'qryWCT',
    qry3: service + 'qryWCT3',
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
    del: service + 'delRTN',
    snapshot2: service + 'snapshot2RTN',
    snapshot: service + 'snapshotRTN'
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
    qry2: service + 'qry2LBR',
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
    del: service + 'delMAC',
    snapshot: service + 'snapshotMAC'
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
    qry: service + 'qrySTD',
    page: service + 'pageSTD',
    set: service + 'setSTD',
    get: service + 'getSTD',
    del: service + 'delSTD'
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
    page: service + 'pageOVH',
    snapshot: service + 'snapshotOVH'
  },
  Design: {
    qry: service + 'qryDES',
    set: service + 'setDES',
    get: service + 'getDES',
    del: service + 'delDES',
    snapshot: service + 'snapshotDES',
    page: service + 'pageDES'
  },
  MFJobOrder: {
    pack: service + 'packJOB',
    qry: service + 'qryJOB',
    qry2: service + 'qryJOB2',
    set: service + 'setJOB',
    get: service + 'getJOB',
    get2: service + 'get2JOB',
    del: service + 'delJOB',
    snapshot: service + 'snapshotJOB',
    snapshot2: service + 'snapshotJOB2',
    snapshot3: service + 'snapshotJOB3',
    cancel: service + 'cancelJOB',
    post: service + 'postJOB',
    start: service + 'startJOB',
    stop: service + 'stopJOB',
    wip: service + 'wipJOB',
    sync: service + 'syncJOB'
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
  WorksheetMaterials: {
    qry: service + 'qryIMA',
    get: service + 'getIMA',
    pack: service + 'get2IMA',
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
    post: service + 'postDMG',
    get2: service + 'get2DMG',
    set2: service + 'set2DMG',
    preview: service + 'previewDMG'
  },
  JobCategory: {
    qry: service + 'qryJCA'
  },
  JobRouting: {
    qry: service + 'qryJRO',
    get: service + 'getJRO',
    set: service + 'setJRO',
    set2: service + 'set2JRO',
    del: service + 'delJRO',
    sync: service + 'syncJRO',
    close: service + 'closeJRO',
    reopen: service + 'reopenJRO'
  },
  Worksheet: {
    snapshot: service + 'snapshotWST',
    get: service + 'getWST',
    pack: service + 'getPackWST',
    set: service + 'setWST',
    del: service + 'delWST',
    page: service + 'pageWST',
    summary: service + 'summaryWST',
    post: service + 'postWST',
    qry2: service + 'qryWST2',
    draft: service + 'draftWST'
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
    qry2: service + 'qrySRL2',
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
    get2: service + 'get2PO',
    set2: service + 'set2PO',
    del: service + 'delPO',
    page: service + 'pagePO',
    snapshot: service + 'snapshotPO',
    post: service + 'postPO',
    gen: service + 'genPO',
    close: service + 'closePO'
  },
  BillOfMaterials: {
    get: service + 'getBMA',
    qry2: service + 'qry2BMA',
    set: service + 'setBMA',
    del: service + 'delBMA',
    page: service + 'pageBMA',
    snapshot: service + 'snapshotBMA'
  },
  Component: {
    get: service + 'getBMI',
    qry: service + 'qryBMI',
    del: service + 'delBMI',
    set: service + 'setBMI',
    set2: service + 'set2BMI'
  },
  Assembly: {
    get: service + 'getASM',
    set2: service + 'set2ASM',
    del: service + 'delASM',
    page: service + 'pageASM',
    snapshot: service + 'snapshotASM',
    post: service + 'postASM',
    unpost: service + 'unpostASM',
    generate: service + 'genASM'
  },
  AssemblyItems: {
    qry: service + 'qryASC'
  },
  AssemblyLot: {
    get: service + 'getASL',
    set: service + 'setASL'
  },
  AssemblyOverhead: {
    qry: service + 'qryAOH',
    set2: service + 'set2AOH'
  },
  MeasurementScheduleMap: {
    qry: service + 'qryMSM',
    set: service + 'setMSM',
    set2: service + 'set2MSM',
    del: service + 'delMSM'
  },
  JobCategory: {
    set: service + 'setJCA',
    get: service + 'getJCA',
    del: service + 'delJCA',
    page: service + 'pageJCA',
    qry: service + 'qryJCA'
  },
  DesignGroup: {
    qry: service + 'qryDEG',
    set: service + 'setDEG',
    get: service + 'getDEG',
    del: service + 'delDEG',
    page: service + 'pageDEG'
  },
  Components: {
    qry: service + 'qryDEM',
    set2: service + 'set2DEM'
  },
  DesignFamily: {
    qry: service + 'qryDEF',
    set: service + 'setDEF',
    get: service + 'getDEF',
    del: service + 'delDEF',
    page: service + 'pageDEF'
  },
  ProductionShifts: {
    qry: service + 'qrySHI',
    set: service + 'setSHI',
    get: service + 'getSHI',
    del: service + 'delSHI',
    page: service + 'pageSHI'
  },
  JobOrderWizard: {
    set2: service + 'set2JOZ',
    get2: service + 'get2JOZ',
    del: service + 'delJOZ',
    page: service + 'pageJOZ',
    snapshot: service + 'snapshotJOZ',
    post: service + 'postJOZ'
  },
  JobTransfer: {
    get2: service + 'get2TFR',
    set2: service + 'set2TFR',
    del: service + 'delTFR',
    page: service + 'pageTFR',
    snapshot: service + 'snapshotTFR',
    post: service + 'postTFR',
    close: service + 'closeTFR',
    reopen: service + 'reopenTFR',
    qry: service + 'qryTFR'
  },
  JobWorkCenter: {
    qry: service + 'qryJWC',
    close: service + 'closeJWC',
    reopen: service + 'reopenJWC',
    get: service + 'getJWC',
    snapshot: service + 'snapshotJWC',
    verify: service + 'verifyJWC'
  },
  WorkCenterConsumption: {
    page: service + 'pageCON',
    snapshot: service + 'snapshotCON',
    del: service + 'delCON',
    set2: service + 'set2CON',
    get: service + 'getCON',
    post: service + 'postCON',
    unpost: service + 'unpostCON',
    close: service + 'closeCON',
    reopen: service + 'reopenCON'
  },
  ConsumptionItemView: {
    qry: service + 'qryCOI'
  },
  LineItemCapacity: {
    set2: service + 'set2LIT',
    del: service + 'delLIT',
    qry: service + 'qryLIT',
    page: service + 'pageLIT'
  },
  CostGroupOverhead: {
    set2: service + 'set2CGV',
    qry: service + 'qryCGV'
  },
  IssueOfMaterialDimension: {
    set: service + 'setIMD',
    qry: service + 'qryIMD'
  },
  JobOrder: {
    gen: service + 'genORD'
  },
  RefreshPoItem: {
    refresh: service + 'refreshPOI'
  },
  WorkCenterTransferMap: {
    qry: service + 'qryWCTM',
    set2: service + 'set2WCTM'
  },
  BatchWorksheet: {
    get2: service + 'get2BWST',
    set2: service + 'set2BWST',
    del: service + 'delBWST',
    page: service + 'pageBWST',
    snapshot: service + 'snapshotBWST',
    post: service + 'postBWST',
    gen: service + 'genBWST',
    close: service + 'closeBWST',
    reopen: service + 'reopenBWST'
  },
  ProductionOrderFromSaleOrder: {
    gen: service + 'generatePOFromSO'
  },
  BatchTransfer: {
    page: service + 'pageBTFR',
    set2: service + 'set2BTFR',
    del: service + 'delBTFR',
    snapshot: service + 'snapshotBTFR',
    get: service + 'getBTFR',
    post: service + 'postBTFR',
    unpost: service + 'unpostBTFR'
  },
  BatchTransferJob: {
    qry: service + 'qryBTFJ'
  },
  Disposal: {
    page: service + 'pageDIS',
    snapshot: service + 'snapshotDIS',
    get: service + 'getDIS',
    set2: service + 'set2DIS',
    del: service + 'delDIS'
  },
  DisposalItem: {
    qry: service + 'qryDII'
  },
  DisposalSerial: {
    qry: service + 'qryDISRL'
  },
  MetalSetting: {
    page: service + 'pageMTS',
    set: service + 'setMTS',
    get: service + 'getMTS',
    del: service + 'delMTS'
  },
  DamageReason: {
    qry: service + 'qryDRS',
    page: service + 'pageDRS',
    set: service + 'setDRS',
    get: service + 'getDRS',
    del: service + 'delDRS',
    snapshot: service + 'snapshotDRS'
  },
  DamageCategory: {
    qry: service + 'qryDCA',
    page: service + 'pageDCA',
    set: service + 'setDCA',
    get: service + 'getDCA',
    del: service + 'delDCA',
    snapshot: service + 'snapshotDCA'
  }
}
