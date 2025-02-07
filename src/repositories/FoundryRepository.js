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
    get: service + 'getWAX',
    del: service + 'delWAX'
  },
  Mould: {
    qry: service + 'qryMOU'
  }
}
