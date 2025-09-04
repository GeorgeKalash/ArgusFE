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
    qry: service + 'qryPC',
    set: service + 'setPC',
    del: service + 'delPC',
    get: service + 'getPC'
  },
  LedgerGroup: {
    qry: service + 'qryGLG',
    get: service + 'getGLG',
    set: service + 'setGLG',
    del: service + 'delGLG'
  },
  CnssBranches: {
    page: service + 'pageSB',
    get: service + 'getSB',
    set: service + 'setSB',
    del: service + 'delSB'
  }
}
