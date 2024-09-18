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
  StockCount: {
    qry: service + 'qryHDR',
    get: service + 'getHDR',
    set: service + 'setHDR',
    del: service + 'delHDR'
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
  Sites: {
    qry: service + 'qrySIT',
    reopen: service + 'reopenSIT',
    end: service + 'endSIT',
  }
}
