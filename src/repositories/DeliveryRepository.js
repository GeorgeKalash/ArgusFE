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
    get: service + 'getET',
    set: service + 'setET',
    del: service + 'delET',
    page: service + 'pageET'
  },
  DeliveriesOrders: {
    qry: service + 'qryORD',
    get: service + 'getORD',
    snapshot: service + 'snapshotORD',
    unpost: service + 'unpostORD',
    post: service + 'postORD',
    del: service + 'delORD',
    cancel: service + 'cancelORD',
    flag: service + 'flagORD',
    set2: service + 'set2ORD',
    generate: service + 'generateIVC2'
  },
  OrderItem: {
    qry: service + 'qryORI',
    get: service + 'getORI'
  },
  MW: {
    qry: service + 'qryMW2'
  },
  DeliveryLeadTime: {
    get: service + 'getLDT',
    page: service + 'pageLDT',
    set: service + 'setLDT',
    del: service + 'delLDT'
  }
}
