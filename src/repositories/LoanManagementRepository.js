const service = 'LM.asmx/'

export const LoanManagementRepository = {
  IndemnityAccuralsFilters: {
    qry: service + 'qryLT'
  },
  LeaveScheduleFilters: {
    qry: service + 'qryLS'
  },
  OpeningBalances: {
    page: service + 'pageOBA',
    set: service + 'setOBA',
    get: service + 'getOBA',
    del: service + 'delOBA',
    qry: service + 'qryOBA'
  }
}
