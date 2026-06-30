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
  Dashboard: {
    dashboard: service + 'dashboard',
    dashBoardPE: service + 'qryPE',
    dashBoardLE: service + 'qryLE',
    dashBoardDO: service + 'qryDO',
    dashBoardNS: service + 'qryNS',
    dashBoardCH: service + 'qryCH'
  },
  BranchAvailability: {
    qry: service + 'qryBA'
  },
  PaidLeave: {
    qry: service + 'qryPL'
  },
  UnpaidLeave: {
    qry: service + 'qryUL'
  },
  AttendancePeriod: {
    qry: service + 'qryAP'
  },
  TimeVariations: {
    qry: service + 'qryTV'
  }
}
