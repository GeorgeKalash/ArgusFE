const service = 'PY.asmx/'

export const PayrollRepository = {
  PayrollFilters: {
    qry: service + 'qryHE'
  },
  BankTransferFilters: {
    qry: service + 'qrySB'
  },
  Penalty: {
    qry: service + 'qryPT'
  },
  Paycode: {
    qry: service + 'qryPC'
  },
  LedgerGroup: {
    qry: service + 'qryGLG',
    get: service + 'getGLG',
    set: service + 'setGLG',
    del: service + 'delGLG'
  },
  Arguments: {
    page: service + 'pageAR',
  },
  CnssBranches: {
    page: service + 'pageSB',
    get: service + 'getSB',
    set: service + 'setSB',
    del: service + 'delSB'
  },
  SalaryBatch: {
    page: service + 'pageBAT',
    get: service + 'getBAT',
    set: service + 'setBAT',
    del: service + 'delBAT'
  }
}
