const service = 'CCTRX.asmx/'

export const CCTRXrepository = {
  CashCountTransaction: {
    qry: service + 'qryTRX',
    get2: service + 'get2TRX',
    set2: service + 'set2TRX',
    post: service + 'postTRX',
    close: service + 'closeTRX',
    reopen: service + 'reopenTRX',
    del: service + 'delTRX'
  }
}
