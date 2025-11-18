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
    page: service + 'pageLD',
    get: service + 'getLD',
    set: service + 'setLD',
    del: service + 'delLD'
  }
}
