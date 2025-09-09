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
    qry: service + 'qryFSN',
    get: service + 'getFSN',
    set: service + 'setFSN'
  },
  Ledger: {
    qry: service + 'qryFSL',
    set2: service + 'set2FSL'
  },
  Title: {
    qry: service + 'qryFST',
    set2: service + 'set2FST'
  }
}
