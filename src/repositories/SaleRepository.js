const service = 'SA.asmx/'

export const SaleRepository = {
  PriceLevel: {
    qry: service + 'qryPL',
    get: service + 'getPL',
    set: service + 'setPL',
    del: service + 'delPL'
  },
  SalesPerson: {
    qry: service + 'qrySP',
    get: service + 'getSP',
    set: service + 'setSP',
    del: service + 'delSP'
  },
  SalesTeam: {
    qry: service + 'qrySPT'
  },
  Target: {
    qry: service + 'qryTGT',
    set2: service + 'set2TGT'
  }
}
