const service = 'SA.asmx/'

export const SaleRepository = {
  PriceLevel: {
    qry: service + 'qryPL',
    get: service + 'getPL',
    set: service + 'setPL',
    del: service + 'delPL',
    page: service + 'pagePL'
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
    page: service + 'pageSP',
    snapshot: service + 'snapshotSP'
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
  },
  TargetMonth: {
    qry: service + 'qryTGM',
    set2: service + 'set2TGM'
  },
  Client: {
    snapshot: service + 'snapshotCL'
  },
  WorkFlow: {
    graph: service + 'graph'
  },
  Sales: {
    qry: service + 'qryPR',
    get: service + 'getPR',
    set: service + 'setPR',
    del: service + 'delPR'
  }
}
