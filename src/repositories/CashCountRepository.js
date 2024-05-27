const service = 'CC.asmx/'

export const CashCountRepository = {
  CashCountTransaction: {
    qry: service + 'qryTRX',
    get2: service + 'get2TRX',
    set2: service + 'set2TRX',
    post: service + 'postTRX',
    close: service + 'closeTRX',
    reopen: service + 'reopenTRX',
    del: service + 'delTRX'
  },
  CcCashNotes: {
    qry: service + 'qryNOT',
    get: service + 'getNOT',
    set: service + 'setNOT',
    del: service + 'delNOT',
    page: service + 'pageNOT'
  }
}
