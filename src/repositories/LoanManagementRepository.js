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
  },
  BalanceAdjustment: {
    page: service + 'pageBA',
    set: service + 'setBA',
    get: service + 'getBA',
    del: service + 'delBA',
    snapshot: service + 'snapshotBA'
  },
  LeaveRequest: {
    page: service + 'pageLR',
    set: service + 'setLR',
    get: service + 'getLR',
    del: service + 'delLR',
    snapshot: service + 'snapshotLR',
    close: service + 'closeLR',
    reopen: service + 'reopenLR'
  }
}
