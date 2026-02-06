const service = 'LM.asmx/'

export const LoanManagementRepository = {
  IndemnityAccuralsFilters: {
    qry: service + 'qryLT'
  },
  LeaveScheduleFilters: {
    qry: service + 'qryLS',
    page: service + 'pageLS',
    set: service + 'setLS',
    get: service + 'getLS',
    del: service + 'delLS'
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
  EarnedLeave: {
    page: service + 'pageEL',
    set2: service + 'set2EL',
    get2: service + 'get2EL',
    del: service + 'delEL',
    preview: service + 'previewEL',
    post: service + 'postEL',
  },
  LeavePeriod: {
    qry: service + 'qryLP',
    del: service + 'delLP',
    get: service + 'getLP',
    set: service + 'setLP'
  },
  LeaveRequest: {
    page: service + 'pageLR',
    qry: service + 'qryLR',
    set: service + 'setLR',
    get: service + 'getLR',
    del: service + 'delLR',
    snapshot: service + 'snapshotLR',
    close: service + 'closeLR',
    reopen: service + 'reopenLR',
    set2: service + 'set2LR',
    get2: service + 'get2LR'
  },
  LeaveReturn: {
    page: service + 'pageRE',
    set: service + 'setRE',
    get: service + 'getRE',
    del: service + 'delRE',
    snapshot: service + 'snapshotRE',
    close: service + 'closeRE',
    reopen: service + 'reopenRE'
  },
  PreviewDays: {
    preview: service + 'previewLD'
  },
  Leaves: {
    qry: service + 'qryELB'
  }
}
