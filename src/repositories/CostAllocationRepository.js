const service = 'CO.asmx/'

export const CostAllocationRepository = {
  CACostTypes: {
    qry: service + 'qryTYP',
    page: service + 'pageTYP',
    get: service + 'getTYP',
    set: service + 'setTYP',
    del: service + 'delTYP'
  },
  PuCostAllocations: {
    qry: service + 'qryTRX',
    page: service + 'pageTRX',
    get: service + 'getTRX',
    set: service + 'setTRX',
    del: service + 'delTRX',
    post: service + 'postTRX',
    unpost: service + 'unpostTRX',
    close: service + 'closeTRX',
    reopen: service + 'reopenTRX',
    snapshot: service + 'snapshotTRX'
  },
  TrxCostType: {
    qry: service + 'qryTCT',
    page: service + 'pageTCT',
    get: service + 'getTCT',
    set: service + 'setTCT',
    del: service + 'delTCT'
  },
  Invoice: {
    qry: service + 'qryIVC',
    set2: service + 'set2IVC'
  },
  TrxDstribution: {
    qry: service + 'qryICT'
  },
  InvoicesItems: {
    qry: service + 'qryITM'
  }
}
