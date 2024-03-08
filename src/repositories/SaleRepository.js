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
  CommissionSchedule: {
    qry: service + 'qryCSC',
    get: service + 'getCSC',
    set: service + 'setCSC',
    del: service + 'delCSC',
    set2: service + 'set2CSC'
  },
  CommissionScheduleBracket: {
    qry: service + 'qryCSB'
  },
  SalesPerson: {
    qry: service + 'qrySP',
    get: service + 'getSP',
    set: service + 'setSP',
    del: service + 'delSP',
    page: service + 'pageSP'
  },
  SalesZone: {
    qry: service + 'qrySZ',
    get: service + 'getSZ',
    set: service + 'setSZ',
    del: service + 'delSZ',
    page: service + 'pageSZ'
  },
  SalesTeam: {
    qry: service + 'qrySPT'
  },
  Target: {
    qry: service + 'qryTGT',
    set2: service + 'set2TGT',
    get: service + 'getTGT'
  }
}
