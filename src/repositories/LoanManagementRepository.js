const service = 'LM.asmx/'

export const LoanManagementRepository = {
  IndemnityAccuralsFilters: {
    qry: service + 'qryLT'
  },
  LeaveScheduleFilters: {
    qry: service + 'qryLS'
  },
  LeaveManagementFilters: {
    page: service + 'pageOBA',
    set: service + 'setOBA',
    get: service + 'getOBA',
    del: service + 'delOBA',
    qry: service + 'qryOBA'
  }
}
