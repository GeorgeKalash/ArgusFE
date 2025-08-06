const service = 'EP.asmx/'

export const EmployeeRepository = {
  Employee: {
    snapshot: service + 'snapshotEM',
    get1: service + 'getEM1'
  },
  CertificateFilters: {
    qry: service + 'qryCL',
    get: service + 'getCL',
    set: service + 'setCL',
    del: service + 'delCL',
    page: service + 'pageCL'
  },
  HRDocTypeFilters: {
    qry: service + 'qryDT'
  },
  SalaryChangeReasonFilters: {
    qry: service + 'qrySC',
    get: service + 'getSC',
    set: service + 'setSC',
    del: service + 'delSC',
    page: service + 'pageSC'
  },
  EmploymentStatusFilters: {
    qry: service + 'qryST',
    page: service + 'pageST',
    set: service + 'setST',
    get: service + 'getST',
    del: service + 'delST'
  },
  SponsorFilters: {
    qry: service + 'qrySP',
    page: service + 'pageSP',
    set: service + 'setSP',
    get: service + 'getSP',
    del: service + 'delSP'
  },
  RelationshipTypes: {
    page: service + 'pageRT',
    set: service + 'setRT',
    get: service + 'getRT',
    del: service + 'delRT'
  },
  BonusTypes: {
    get: service + 'getBT',
    set: service + 'setBT',
    page: service + 'pageBT',
    del: service + 'delBT'
  },
  BgCheck: {
    page: service + 'pageCT',
    set: service + 'setCT',
    get: service + 'getCT',
    del: service + 'delCT'
  },
  NoticePeriods: {
    get: service + 'getNP',
    set: service + 'setNP',
    del: service + 'delNP',
    page: service + 'pageNP'
  },
  CustomProperties: {
    get: service + 'getUP',
    set: service + 'setUP',
    del: service + 'delUP',
    page: service + 'pageUP'
  },
  TerminationReasons: {
    get: service + 'getTR',
    set: service + 'setTR',
    del: service + 'delTR',
    page: service + 'pageTR'
  },
  JobInfo: {
    snapshot: service + 'snapshotJI',
    page: service + 'pageJI',
    close: service + 'closeJI',
    reopen: service + 'reopenJI',
    get: service + 'getJI',
    set: service + 'setJI',
    del: service + 'delJI'
  },
  QuickView: {
    get: service + 'getQV'
  }
}
