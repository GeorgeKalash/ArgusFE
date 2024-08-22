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
  }
}
