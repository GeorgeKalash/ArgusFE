const service = 'EP.asmx/'

export const EmployeeRepository = {
  Employee: {
    snapshot: service + 'snapshotEM',
    get1: service + 'getEM1',
    set: service + 'setEM',
    del: service + 'delEM'
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
  SalaryChangeReason: {
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
    qry: service + 'qryNP',
    page: service + 'pageNP'
  },
  CustomProperties: {
    get: service + 'getUP',
    set: service + 'setUP',
    del: service + 'delUP',
    page: service + 'pageUP',
    qry: service + 'qryUP'
  },
  ResignationRequest: {
    get: service + 'getRR',
    set: service + 'setRR',
    del: service + 'delRR',
    page: service + 'pageRR',
    close: service + 'closeRR',
    reopen: service + 'reopenRR'
  },
  TerminationReasons: {
    qry: service + 'qryTR',
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
    del: service + 'delJI',
    qry: service + 'qryJI'
  },
  QuickView: {
    get: service + 'getQV'
  },
  EmployeePenalty: {
    page: service + 'pagePE',
    close: service + 'closePE',
    reopen: service + 'reopenPE',
    get: service + 'getPE',
    set: service + 'setPE',
    del: service + 'delPE'
  },
  EmployeeDeduction: {
    qry: service + 'qryED',
    page: service + 'pageED',
    del: service + 'delED',
    get: service + 'getED',
    set: service + 'setED',
    snapshot: service + 'snapshotED'
  },
  FullName: {
    sync: service + 'syncFullName'
  },
  EmployeeChart: {
    page: service + 'pageES',
    qry: service + 'qryES',
    qry2: service + 'qryES2'
  },
  EmployeeSalary: {
    qry: service + 'qrySA',
    get: service + 'getSA',
    set: service + 'setSA',
    del: service + 'delSA'
  },
  SalaryDetails: {
    qry: service + 'qrySD',
    get: service + 'getSD',
    set2: service + 'set2SD',
    del: service + 'delSD'
  },
  TerminationEmployee: {
    get: service + 'getTE'
  },
  EmployementHistory: {
    qry: service + 'qryEH',
    del: service + 'delEH',
    get: service + 'getEH',
    set: service + 'setEH'
  },
  Hiring: {
    get: service + 'getRE',
    set: service + 'setRE'
  },
  Skills: {
    qry: service + 'qryCE',
    del: service + 'delCE',
    get: service + 'getCE',
    set: service + 'setCE'
  },
  UserDefined: {
    qry: service + 'qryUV',
    set2: service + 'set2UV'
  },
  Leaves: {
    set: service + 'setLS',
    del: service + 'delLS',
    get: service + 'getLS'
  }
}

