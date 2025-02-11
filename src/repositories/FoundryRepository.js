const service = 'FO.asmx/'

export const FoundryRepository = {
  WorkCenter: {
    page: service + 'pageWCT',
    qry: service + 'qryWCT',
    set: service + 'setWCT',
    get: service + 'getWCT',
    del: service + 'delWCT'
  },
  Wax: {
    page: service + 'pageWAX',
    qry: service + 'qryWAX',
    snapshot: service + 'snapshotWAX',
    set: service + 'setWAX',
    set2: service + 'set2WAX',
    get: service + 'getWAX',
    del: service + 'delWAX',
    post: service + 'postWAX',
    unpost: service + 'unpostWAX',
    close: service + 'closeWAX',
    reopen: service + 'reopenWAX'
  },
  WaxJob: {
    qry: service + 'qryWAJ'
  },
  Mould: {
    qry: service + 'qryMOU'
  },
  MetalSetting: {
    get: service + 'getMTS'
  }
}
