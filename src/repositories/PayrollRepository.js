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
  SecuritySchedule: {
    qry: service + 'qrySS'
  },
  IndemnitySchedule: {
    qry: service + 'qryIS'
  },
  LedgerGroup: {
    qry: service + 'qryGLG',
    get: service + 'getGLG',
    set: service + 'setGLG',
    del: service + 'delGLG'
  },
  Arguments: {
    page: service + 'pageAR'
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
  },
  TimeCodes: {
    page: service + 'pageTC',
    get: service + 'getTC',
    set: service + 'setTC',
    del: service + 'delTC'
  },
  Indemnity: {
    page: service + 'pageIS',
    get: service + 'getIS',
    set: service + 'setIS',
    del: service + 'delIS'
  },
  IndemnityCompany: {
    qry: service + 'qryID',
    set2: service + 'set2ID'
  },
  IndemnityResignation: {
    qry: service + 'qryIR',
    set2: service + 'set2IR'
  }
}
