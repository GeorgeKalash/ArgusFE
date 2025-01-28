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
  }
}
