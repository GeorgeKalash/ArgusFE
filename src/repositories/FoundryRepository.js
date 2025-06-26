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
    snapshot: service + 'snapshotWAX',
    set: service + 'setWAX',
    set2: service + 'set2WAX',
    get: service + 'getWAX',
    del: service + 'delWAX',
    post: service + 'postWAX',
    unpost: service + 'unpostWAX',
    close: service + 'closeWAX',
    open: service + 'openWAX',
    reopen: service + 'reopenWAX'
  },
  WaxJob: {
    qry: service + 'qryWAJ',
    qry2: service + 'qry2WAJ'
  },
  Mould: {
    qry: service + 'qryMOU',
    page: service + 'pageMOU',
    set: service + 'setMOU',
    get: service + 'getMOU',
    del: service + 'delMOU',
    snapshot: service + 'snapshotMOU'
  },
  MetalSettings: {
    page: service + 'pageMTS',
    set: service + 'setMTS',
    get: service + 'getMTS',
    del: service + 'delMTS'
  },
  Scrap: {
    qry: service + 'qryMSC',
    set2: service + 'set2MSC'
  },
  JobWaxInquiry: {
    qry2: service + 'qry2WAJ'
  },
  Casting: {
    page: service + 'pageCAS',
    get: service + 'getCAS',
    set: service + 'setCAS',
    del: service + 'delCAS',
    cancel: service + 'cancelCAS',
    post: service + 'postCAS',
    snapshot: service + 'snapshotCAS'
  },
  CastingDisassembly: {
    qry: service + 'qryCDA',
    set2: service + 'set2CDA'
  },
  MetalScrap: {
    qry: service + 'qryMSC'
  },
  CastingJob: {
    qry: service + 'qryCAJ',
    set2: service + 'set2CAJ'
  }
}
