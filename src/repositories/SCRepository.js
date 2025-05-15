const service = 'SC.asmx/'

export const SCRepository = {
  LabelTemplate: {
    qry: service + 'qryLBT',
    set: service + 'setLBT',
    get: service + 'getLBT',
    del: service + 'delLBT'
  },
  Item: {
    qry: service + 'qryLBI',
    set: service + 'setLBI',
    get: service + 'getLBI',
    del: service + 'delLBI'
  },
  Sites: {
    qry: service + 'qrySIT',
    set: service + 'setSIT',
    set2: service + 'set2SIT',
    get: service + 'getSIT',
    del: service + 'delSIT',
    reopen: service + 'reopenSIT',
    end: service + 'endSIT'
  },
  Controller: {
    qry: service + 'qryCRL'
  },
  StockCountControllerTab: {
    qry: service + 'qryPHY',
    set2: service + 'set2PHY',
    set: service + 'setPHY',
    get: service + 'getPHY',
    del: service + 'delPHY'
  },
  StockCount: {
    page: service + 'pageHDR',
    post: service + 'postHDR',
    unpost: service + 'unpostHDR',
    qry: service + 'qryHDR',
    get: service + 'getHDR',
    set: service + 'setHDR',
    del: service + 'delHDR',
    close: service + 'closeHDR',
    reopen: service + 'reopenHDR',
    snapshot: service + 'snapshotHDR'
  },
  StockCountController: {
    page: service + 'pageCRL',
    set: service + 'setCRL',
    get: service + 'getCRL',
    del: service + 'delCRL'
  },
  DocumentTypeDefaults: {
    qry: service + 'qryDTD',
    set: service + 'setDTD',
    get: service + 'getDTD',
    del: service + 'delDTD'
  },
  StockCountItem: {
    qry: service + 'qryITM',
    set: service + 'setITM',
    get: service + 'getITM',
    del: service + 'delITM'
  },
  StockCountSerialSum: {
    qry: service + 'qrySRS'
  },
  StockCountItemDetail: {
    qry: service + 'qryITD',
    set: service + 'setITD',
    get: service + 'getITD',
    del: service + 'delITD',
    set2: service + 'set2ITD'
  },
  StockCountSerialDetail: {
    set2: service + 'set2SRL',
    qry: service + 'qrySRL',
    append: service + 'appendSRL',
    del: service + 'delSRL'
  }
}
