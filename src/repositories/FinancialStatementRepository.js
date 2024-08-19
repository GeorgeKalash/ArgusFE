const service = 'FS.asmx/'

export const FinancialStatementRepository = {
  FinancialStatement: {
    qry: service + 'qryFS',
    get: service + 'getFS',
    set: service + 'setFS',
    del: service + 'delFS'
  }
}
