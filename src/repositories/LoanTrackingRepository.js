const service = 'LT.asmx/'

export const LoanTrackingRepository = {
  LoanType: {
    get: service + 'getLT',
    set: service + 'setLT',
    del: service + 'delLT',
    qry: service + 'qryLT',
    page: service + 'pageLT'
  },
  Loans: {
    get: service + 'getLR',
    set: service + 'setLR',
    del: service + 'delLR',
    page: service + 'pageLR',
    close: service + 'closeLR',
    reopen: service + 'reopenLR'
  },
  LoanDeduction: {
    qry: service + 'qryLD',
    get: service + 'getLD',
    set: service + 'setLD'
  }
}
