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
    qry: service + 'qryST',
    page: service + 'pageST',
    set: service + 'setST',
    get: service + 'getST',
    del: service + 'delST'
  },
  SponsorFilters: {
    qry: service + 'qrySP'
  },
  BgCheck: {
    page: service + 'pageCT',
    set: service + 'setCT',
    get: service + 'getCT',
    del: service + 'delCT'
  }
}
