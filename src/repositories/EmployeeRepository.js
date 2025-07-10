const service = 'EP.asmx/'

export const EmployeeRepository = {
  Employee: {
    snapshot: service + 'snapshotEM',
    get1: service + 'getEM1'
  },
  Certificate: {
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
    qry: service + 'qrySC'
  },
  EmploymentStatusFilters: {
    qry: service + 'qryST'
  },
  SponsorFilters: {
    qry: service + 'qrySP'
  }
}
