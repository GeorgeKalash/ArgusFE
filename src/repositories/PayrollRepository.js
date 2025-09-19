const service = 'PY.asmx/'

export const PayrollRepository = {
  PayrollFilters: {
    qry: service + 'qryHE'
  },
  BankTransferFilters: {
    qry: service + 'qrySB'
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
    qry: service + 'qryTC',
    get: service + 'getTC',
    set: service + 'setTC',
    del: service + 'delTC'
  },
  PenaltyType: {
    page: service + 'pagePT',
    qry: service + 'qryPT',
    get: service + 'getPT',
    set: service + 'setPT',
    del: service + 'delPT'
  },
  PenaltyDetail: {
    qry: service + 'qryPD',
    set2: service + 'set2PD'
  }
}
