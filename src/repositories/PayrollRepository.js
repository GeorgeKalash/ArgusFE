const service = 'PY.asmx/'

export const PayrollRepository = {
  Payroll: {
    qry: service + 'qryHE',
    page: service + 'pageHE',
    get: service + 'getHE',
    set: service + 'setHE',
    del: service + 'delHE',
    close: service + 'closeHE',
    reopen: service + 'reopenHE',
    post: service + 'postHE',
    unpost: service + 'unpostHE',
    snapshot: service + 'snapshotHE'
  },
  BankTransferFilters: {
    qry: service + 'qrySB',
    page: service + 'pageSB',
    get: service + 'getSB',
    set: service + 'setSB',
    del: service + 'delSB'
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
    page: service + 'pageIS',
    qry: service + 'qryIS',
    get: service + 'getIS',
    set: service + 'setIS',
    del: service + 'delIS'
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
  FinalSettlement: {
    page: service + 'pageFS',
    get: service + 'getFS',
    set: service + 'setFS',
    del: service + 'delFS',
    snapshot: service + 'snapshotFS'
  },

  IndemnityCompany: {
    qry: service + 'qryID',
    set2: service + 'set2ID'
  },
  IndemnityResignation: {
    qry: service + 'qryIR',
    set2: service + 'set2IR'
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
  },
  GeneratePayroll: {
    gen: service + 'genEM',
    page: service + 'pageEM'
  },
  PayrollDetails: {
    qry: service + 'qryED',
    set2: service + 'set2ED'
  },
  SocialSecurity: {
    qry: service + 'qryES'
  },
  FiscalYear: {
    qry: service + 'qryYE'
  },
  Period: {
    qry: service + 'qryPE'
  }
}
