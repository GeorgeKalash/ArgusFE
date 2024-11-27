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
  PHY: {
    qry: service + 'qryPHY',
    set2: service + 'set2PHY'
  },
  StockCount: {
    page: service + 'pageHDR',
    post: service + 'postHDR',
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
  StockCountItemDetail: {
    qry: service + 'qryITD',
    set: service + 'setITD',
    get: service + 'getITD',
    del: service + 'delITD',
    set2: service + 'set2ITD' //StockCountItemDetailPack
  },
  StockCountControllerTab: {
    qry: service + 'qryPHY',
    set: service + 'setPHY',
    get: service + 'getPHY',
    del: service + 'delPHY'
  }
}
