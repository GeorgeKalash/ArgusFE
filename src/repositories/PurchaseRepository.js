const service = 'PU.asmx/'

export const PurchaseRepository = {
  VendorGroups: {
    qry: service + 'qryGRP',
    page: service + 'pageGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  },
  PriceList: {
    qry: service + 'qryPRI',
    del: service + 'delPRI',
    get: service + 'getPRI',
    set: service + 'setPRI'
  },
  PUOrderStatus: {
    qry: service + 'qryPOS',
    page: service + 'pagePOS',
    get: service + 'getPOS',
    set: service + 'setPOS',
    del: service + 'delPOS'
  },
  DeliveryMethods: {
    qry: service + 'qryDM',
    page: service + 'pageDM',
    get: service + 'getDM',
    set: service + 'setDM',
    del: service + 'delDM'
  },
  PaymentTerms: {
    qry: service + 'qryPT',
    page: service + 'pagePT',
    get: service + 'getPT',
    set: service + 'setPT',
    del: service + 'delPT'
  },
  Vendor: {
    snapshot: service + 'snapshotVEN',
    qry: service + 'qryVEN',
    page: service + 'pageVEN',
    get: service + 'getVEN',
    set: service + 'setVEN',
    del: service + 'delVEN'
  },
  Address: {
    qry: service + 'qryAD',
    page: service + 'pageAD',
    get: service + 'getAD',
    set: service + 'setAD',
    del: service + 'delAD'
  },
  DocumentTypeDefault: {
    qry: service + 'qryDTD',
    get: service + 'getDTD',
    set: service + 'setDTD',
    del: service + 'delDTD',
    page: service + 'pageDTD'
  },
  PurchaseInvoiceHeader: {
    qry: service + 'qryIVC',
    get: service + 'getIVC',
    get2: service + 'get2IVC',
    level2_PU: service + 'level2_PU',
    set: service + 'setIVC',
    del: service + 'delIVC',
    snapshot: service + 'snapshotIVC',
    set2: service + 'set2IVC',
    post: service + 'postIVC',
    unpost: service + 'unpostIVC',
    generate: service + 'generateIVC',
    preview: service + 'previewIVC',
    sync: service + 'syncIVC'
  },
  Invoice: {
    snapshot: service + 'snapshotINV'
  },
  PurchaseReturnHeader: {
    qry: service + 'qryIVR',
    snapshot: service + 'snapshotIVR'
  },
  VendorPrice: {
    get: service + 'getPRI2'
  },
  ItemCostHistory: {
    qry: service + 'qryIPH'
  },
  ItemPromotion: {
    qry: service + 'qryIVIM'
  },
  Serials: {
    qry: service + 'qrySRL',
    import: service + 'importSRL'
  },
  Shipment: {
    get: service + 'getSHP',
    set2: service + 'set2SHP',
    del: service + 'delSHP',
    page: service + 'pageSHP',
    snapshot: service + 'snapshotSHP',
    post: service + 'postSHP',
    unpost: service + 'unpostSHP',
    gen: service + 'genSHP'
  },
  ShipmentItem: {
    qry: service + 'qrySHI'
  },
  UnpostedOrderPack: {
    get: service + 'openORD',
    snapshot: service + 'snapshotORD'
  },
  PurchaseOrder: {
    page: service + 'pageORD',
    snapshot: service + 'snapshotORD',
    del: service + 'delORD',
    set2: service + 'set2ORD',
    get2: service + 'get2ORD',
    close: service + 'closeORD',
    reopen: service + 'reopenORD',
    terminate: service + 'terminateORD',
    transfer: service + 'transfer1ORD'
  },
  Request: {
    snapshot: service + 'snapshotREQ'
  },
  Requisition: {
    qry: service + 'qryREI'
  },
  QuotationItem: {
    preview: service + 'previewQTI'
  },
  OrderItem: {
    qry: service + 'qryORI',
    set2: service + 'set2ORI'
  },
  PUDraftReturn: {
    set2: service + 'set2DRE',
    get: service + 'getDRE',
    page: service + 'pageDRE',
    snapshot: service + 'snapshotDRE',
    del: service + 'delDRE'
  },
  PUDraftReturnSerial: {
    get2: service + 'get2DRS',
    qry: service + 'qryDRS',
    del: service + 'delDRS',
    append: service + 'appendDRS',
    batch: service + 'batchDRS'
  }
}
