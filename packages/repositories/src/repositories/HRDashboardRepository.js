const service = 'HR.DB.asmx/'

export const HRDashboardRepository = {
  CompanyRTW: {
    qry: service + 'qryCR'
  },
  EmpRTW: {
    qry: service + 'qryER'
  },
  ProbationEnd: {
    qry: service + 'qryPR'
  },
  SalaryChange: {
    qry: service + 'qrySC'
  },
  EmploymentReview: {
    qry: service + 'qryRE'
  },
  RetirementAge: {
    qry: service + 'qryRS'
  },
  TermEndDate: {
    qry: service + 'qryTE'
  },
  WorkAnniversary: {
    qry: service + 'qryWA'
  },
  EmployeeBirthday: {
    qry: service + 'qryBD'
  },
  LeavingSoon: {
    qry: service + 'qryLS'
  },
  ReturnFromLeave: {
    qry: service + 'qryLR'
  },
  CasePleads: {
    qry: service + 'qryCP'
  },
  TodaysLeave: {
    dashboard: service + 'dashboard'
  },
  BranchAvailability: {
    qry: service + 'qryBA'
  },
  PaidLeave: {
    qry: service + 'qryPL'
  },
  UnpaidLeave: {
    qry: service + 'qryUL'
  }
}
