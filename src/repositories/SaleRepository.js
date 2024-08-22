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
    qry: service + 'qrySPT',
    get: service + 'getSPT',
    set: service + 'setSPT',
    del: service + 'delSPT'
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
  PosUsers: {
    qry: service + 'qrySP',
    get: service + 'getSP',
    set: service + 'setSP',
    del: service + 'delSP',
    page: service + 'pageSP'
  },
  ReturnReasons: {
    qry: service + 'qryRR',
    page: service + 'pageRR',
    get: service + 'getRR',
    set: service + 'setRR',
    del: service + 'delRR'
  },
  ClientGroups: {
    qry: service + 'qryCG',
    get: service + 'getCG',
    set: service + 'setCG',
    del: service + 'delCG',
    page: service + 'pageCG'
  },
  ReturnPolicy: {
    qry: service + 'qryRPO',
    get: service + 'getRPO',
    set: service + 'setRPO',
    del: service + 'delRPO'
  },
  PriceGroups: {
    qry: service + 'qryPG',
    get: service + 'getPG',
    set: service + 'setPG',
    del: service + 'delPG'
  },
  PaymentTerms: {
    qry: service + 'qryPT',
    get: service + 'getPT',
    set: service + 'setPT',
    del: service + 'delPT',
    page: service + 'pagePT'
  }
}
