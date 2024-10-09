const service = 'DE.asmx/'

export const DeliveryRepository = {
  Driver: {
    page: service + 'pageDRV',
    set: service + 'setDRV',
    get: service + 'getDRV',
    qry: service + 'qryDRV',
    del: service + 'delDRV'
  },
  Vehicle: {
    page: service + 'pageVEH',
    set: service + 'setVEH',
    get: service + 'getVEH',
    qry: service + 'qryVEH',
    del: service + 'delVEH'
  },
  Trip: {
    page: service + 'pageTRP',
    set: service + 'setTRP',
    get: service + 'getTRP',
    qry: service + 'qryTRP',
    del: service + 'delTRP',
    snapshot: service + 'snapshotTRP',

    post: service + 'postTRP',
    close: service + 'closeTRP'
  },
  TripOrderPack2: {
    set2: service + 'set2TRO'
  },
  TripOrder: {
    qry: service + 'qryTRO'
  },
  Reduild: {
    rebuild: service + 'rebuildMW'
  }
}
