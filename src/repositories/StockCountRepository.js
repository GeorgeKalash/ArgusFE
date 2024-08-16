const service = 'SC.asmx/'

export const StockCountRepository = {
  StockCount: {
    qry: service + 'qryHDR',
    get: service + 'getHDR',
    set: service + 'setHDR',
    del: service + 'delHDR'
  }
}
