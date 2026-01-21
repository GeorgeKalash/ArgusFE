const service = 'DE.asmx/'

export const DeliveryRepository = {
  Driver: {
    snapshot: service + 'snapshotDRV',
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
    snapshot2: service + 'snapshot2TRP',
    reopen: service + 'reopenTRP',
    post: service + 'postTRP',
    unpost: service + 'unpostTRP',
    close: service + 'closeTRP',
    generate: service + 'generateTRP',
    setTRP2: service + 'setTRP2',
    assign: service + 'assignTRP',
    unassign: service + 'unassignedTRP'
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
    gen: service + 'genORD',
    post: service + 'postORD',
    del: service + 'delORD',
    cancel: service + 'cancelORD',
    flag: service + 'flagORD',
    set2: service + 'set2ORD'
  },
  Invoice: {
    generate: service + 'generateIVC2',
    generateInv: service + 'generateIVC',
    preview: service + 'previewIVC'
  },
  OrderItem: {
    qry: service + 'qryORI',
    get: service + 'getORI'
  },
  MW: {
    qry: service + 'qryMW2'
  },
  GenerateTrip: {
    root: service + 'rootSZ',
    firstLevel: service + 'firstLevelSZ',
    undelivered2: service + 'undeliveredSO2',
    previewTRP: service + 'previewTRP'
  },
  DeliveryLeadTime: {
    get: service + 'getLDT',
    page: service + 'pageLDT',
    set: service + 'setLDT',
    del: service + 'delLDT'
  },
  Volume: {
    vol: service + 'volZO'
  },
  AllocatedVolume: {
    qry: service + 'qryVEH2'
  },
  InboundTransp: {
    pack: service + 'getPackINB',
    page: service + 'pageINB',
    set2: service + 'set2INB',
    get: service + 'getINB',
    get2: service + 'get2INB',
    del: service + 'delINB',
    snapshot: service + 'snapshotINB',
    post: service + 'postINB',
    unpost: service + 'unpostINB',
  },
  InboundOrders: {
    qry: service + 'qryINO'
  }
}
