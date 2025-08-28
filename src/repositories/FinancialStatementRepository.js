const service = 'FS.asmx/'

export const FinancialStatementRepository = {
  FinancialStatement: {
    page: service + 'pageFS',
    qry: service + 'qryFS',
    get: service + 'getFS',
    set: service + 'setFS',
    del: service + 'delFS'
  },
  Node: {
    qry: service + 'qryFSN'
  },
  Ledger: {
    qry: service + 'qryFSL'
  }
}
