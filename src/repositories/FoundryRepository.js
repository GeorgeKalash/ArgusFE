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
    qry2: service + 'qry2MOU',
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
  },
  FoundaryTransaction: {
    get: service + 'getTRX',
    get2: service + 'get2TRX',
    del: service + 'delTRX',
    set2: service + 'set2TRX',
    page: service + 'pageTRX',
    snapshot: service + 'snapshotTRX',
    post: service + 'postTRX',
    unpost: service + 'unpostTRX'
  },
  AlloyMetals: {
    page: service + 'pageALM',
    set: service + 'setALM',
    get: service + 'getALM',
    del: service + 'delALM',
    qry: service + 'qryALM'
  },
  SmeltingScrapItem: {
    qry: service + 'qrySMSI',
    set2: service + 'set2SMSI'
  },
  DocumentTypeDefault: {
    page: service + 'pageDTD',
    set: service + 'setDTD',
    get: service + 'getDTD',
    del: service + 'delDTD'
  },
  PurityAdjustment: {
    combos: service + 'getPackPADJ',
    get2: service + 'get2PADJ',
    del: service + 'delPADJ',
    set2: service + 'set2PADJ',
    page: service + 'pagePADJ',
    snapshot: service + 'snapshotPADJ',
    post: service + 'postPADJ',
    unpost: service + 'unpostPADJ'
  }
}
