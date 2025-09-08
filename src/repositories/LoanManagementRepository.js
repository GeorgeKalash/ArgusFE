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
    qry: service + 'qryLR',
    set: service + 'setLR',
    get: service + 'getLR',
    del: service + 'delLR',
    snapshot: service + 'snapshotLR',
    close: service + 'closeLR',
    reopen: service + 'reopenLR'
  },
  LeaveReturn: {
    page: service + 'pageRE',
    set: service + 'setRE',
    get: service + 'getRE',
    del: service + 'delRE',
    snapshot: service + 'snapshotRE',
    close: service + 'closeRE',
    reopen: service + 'reopenRE'
  }
}
