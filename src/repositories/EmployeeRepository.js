const service = 'EP.asmx/'

export const EmployeeRepository = {
  Employee: {
    snapshot: service + 'snapshotEM',
    get1: service + 'getEM1'
  },
  CertificateFilters: {
    qry: service + 'qryCL'
  },
  HRDocTypeFilters: {
    qry: service + 'qryDT'
  },
  SalaryChangeReasonFilters: {
    qry: service + 'qrySC'
  },
  EmploymentStatusFilters: {
    qry: service + 'qryST'
  },
  SponsorFilters: {
    qry: service + 'qrySP'
  },
  BonusTypes: {
    qry: service + 'qryBT',
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
  }
}
