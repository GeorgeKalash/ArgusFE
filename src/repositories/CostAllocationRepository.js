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
    get: service + 'getTRX',
    set: service + 'setTRX',
    del: service + 'delTRX',
    post: service + 'postTRX',
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
    qry: service + 'qryIVC'
  },
  TrxDstribution: {
    qry: service + 'qryICT'
  }
}
