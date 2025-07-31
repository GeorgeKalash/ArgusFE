const service = 'LT.asmx/'

export const LoanTrackingRepository = {
  LoanType: {
    get: service + 'getLT',
    set: service + 'setLT',
    del: service + 'delLT',
    page: service + 'pageLT'
  }
}
