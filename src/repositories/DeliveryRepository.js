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
    reopen: service + 'reopenTRP',
    post: service + 'postTRP',
    unpost: service + 'unpostTRP',
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
  },
  TRP: {
    flag: service + 'flagTRP'
  },
  ExpenseTypes: {
    qry: service + 'qryET',
    get: service + 'getET',
    set: service + 'setET',
    del: service + 'delET',
    page: service + 'pageET',
    snapshot: service + 'snapshotET'
  }
}
