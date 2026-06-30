const service = 'BT.asmx/'

export const BrokerageTradingRepository = {
  CommodityPair: {
    qry: service + 'qryCP',
    page: service + 'pageCP',
    set: service + 'setCP',
    del: service + 'delCP',
  },
  FixingSales: {
    page: service + 'pageFIS',
    set: service + 'setFIS',
    del: service + 'delFIS',
    close: service + 'closeFIS',
    get: service + 'getFIS',
    snapshot: service + 'snapshotFIS'
  },
  FixingPurchases: {
    page: service + 'pageFIP',
    set: service + 'setFIP',
    del: service + 'delFIP',
    close: service + 'closeFIP',
    get: service + 'getFIP',
    snapshot: service + 'snapshotFIP'
  },
  Fixing: {
    pack: service + 'getPackFIX',
  },
  EventOrder: {
    page: service + 'pageEO',
    set: service + 'setEO',
    del: service + 'delEO',
    close: service + 'closeEO',
    reopen: service + 'reopenEO',
    get: service + 'getEO',
    snapshot: service + 'snapshotEO',
    pack: service + 'getPackEO'
  }
}
