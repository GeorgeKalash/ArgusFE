const service = 'IV.asmx/'

export const InventoryRepository = {
  Barcode: {
    qry: service + 'qryBCD',
    set2: service + 'set2BCD',
    migrate: service + 'migrateBCD'
  },
  Item: {
    snapshot: service + 'snapshotIT',
    get: service + 'getIT',
    quickView: service + 'quickViewIT'
  },
  Group: {
    qry: service + 'qryGRP',
    page: service + 'pageGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP',
    snapshot: service + 'snapshotGRP'
  },
  Category: {
    page: service + 'pageCA',
    qry: service + 'qryCA',
    get: service + 'getCA',
    set: service + 'setCA',
    del: service + 'delCA',
    snapshot: service + 'snapshotCA'
  },
  LotCategory: {
    page: service + 'pageLCA',
    qry: service + 'qryLCA',
    get: service + 'getLCA',
    set: service + 'setLCA',
    del: service + 'delLCA'
  },
  Measurement: {
    page: service + 'pageMS',
    qry: service + 'qryMS',
    get: service + 'getMS',
    set: service + 'setMS',
    del: service + 'delMS'
  },
  Site: {
    qry: service + 'qrySI',
    get: service + 'getSI',
    set: service + 'setSI',
    del: service + 'delSI',
    page: service + 'pageSI',
    snapshot: service + 'snapshotSI'
  },

  SiteGroups: {
    qry: service + 'qrySGP',
    get: service + 'getSGP',
    set: service + 'setSGP',
    del: service + 'delSGP',
    snapshot: service + 'snapshotSGP'
  },
  Physical: {
    qry: service + 'qryPP',
    get: service + 'getPP',
    set: service + 'setPP',
    calc: service + 'calcPP'
  },
  MaterialsAdjustment: {
    qry: service + 'qryADJ',
    get: service + 'getADJ',
    set: service + 'setADJ',
    set2: service + 'set2ADJ',
    post: service + 'postADJ',
    unpost: service + 'unpostADJ',
    del: service + 'delADJ',
    page: service + 'pageADJ'
  },
  MaterialsAdjustmentDetail: {
    qry: service + 'qryADI'
  },
  Items: {
    pack: service + 'packIT',
    page: service + 'pageIT',
    qry: service + 'qryIT',
    get: service + 'getIT',
    get2: service + 'getIT2',
    set: service + 'setIT',
    del: service + 'delIT',
    snapshot: service + 'snapshotIT2'
  },
  Currency: {
    qry: service + 'qryITC',
    get: service + 'getITC',
    set: service + 'setITC'
  },

  MeasurementUnit: {
    qry: service + 'qryMU',
    get: service + 'getMU',
    set: service + 'setMU',
    del: service + 'delMU'
  },
  Dimension: {
    qry: service + 'qryDI',
    get: service + 'getDI',
    set: service + 'setDI',
    del: service + 'delDI'
  },
  DimensionId: { set: service + 'set2ID', get: service + 'getID' },

  SerialNumber: {
    qry: service + 'qrySPF'
  },

  CategoryCurrency: {
    get: service + 'getCAC',
    qry: service + 'qryCAC',
    set2: service + 'set2CAC',
    del: service + 'delCAC'
  },

  CategorySites: {
    get: service + 'getCAS',
    qry: service + 'qryCAS',
    set2: service + 'set2CAS',
    del: service + 'delCAS'
  },
  Metals: {
    qry: service + 'qryMTL',
    page: service + 'pageMTL',
    get: service + 'getMTL',
    set: service + 'setMTL',
    del: service + 'delMTL'
  },
  Scrap: {
    qry: service + 'qryMTS',
    set2: service + 'set2MTS'
  },
  InventoryOpeningQtys: {
    qry: service + 'qryOQ',
    snapshot: service + 'snapshotOQ',
    get: service + 'getOQ',
    set: service + 'setOQ',
    del: service + 'delOQ'
  },
  SerialProfile: {
    qry: service + 'qrySPF'
  },
  ItemProduction: {
    get: service + 'getMFR',
    set: service + 'setMFR'
  },
  RebuildInventory: {
    rebuild: service + 'rebuildFIS'
  },
  MaterialsTransfer: {
    page: service + 'pageTFR',
    snapshot: service + 'snapshotTFR',
    get: service + 'getTFR',
    set2: service + 'set2TFR',
    del: service + 'delTFR',
    close: service + 'closeTFR',
    reopen: service + 'reopenTFR',
    post: service + 'postTFR',
    unpost: service + 'unpostTFR',
    print: service + 'setTFR_PS'
  },
  MaterialsTransferItems: {
    qry: service + 'qryTFI'
  },
  Cost: {
    get: service + 'getCOS'
  },
  ItemPhysProp: {
    get: service + 'getPP'
  },
  DimensionUDT: {
    set: service + 'set2UDT',
    get: service + 'getUDT'
  },
  Barcodes: {
    snapshot: service + 'snapshotBCD',
    get: service + 'getBCD',
    set: service + 'setBCD',
    del: service + 'delBCD',
    qry: service + 'qryBCD'
  },
  MetalColor: {
    get: service + 'getMTC',
    set: service + 'setMTC',
    qry: service + 'qryMTC',
    del: service + 'delMTC'
  },
  Kit: {
    set: service + 'set2KIT',
    get: service + 'getKIT',
    qry: service + 'qryKIT'
  },
  ItemRetail: {
    qry: service + 'qryITR',
    set: service + 'set2ITR',
    get: service + 'getITR'
  },
  ItemSizes: {
    get: service + 'getSIZ',
    set: service + 'setSIZ',
    del: service + 'delSIZ',
    page: service + 'pageSIZ'
  },
  AvailabilitySerial: {
    qry: service + 'qryAVS'
  },
  AvailabilityLot: {
    qry: service + 'qryLOA'
  },
  CategoryLevel: {
    set2: service + 'set2CAL',
    qry: service + 'qryCAL'
  },
  OpeningCost: {
    get: service + 'getOC',
    set: service + 'setOC',
    del: service + 'delOC',
    qry: service + 'qryOC'
  },
  Transaction: {
    snapshot: service + 'snapshotTRX',
    page: service + 'pageTRX',
    qry2: service + 'qry2TRX',
    qry3: service + 'qry3TRX'
  },
  GenerateFiscalYear: {
    gen: service + 'genFIS'
  },
  IVMDParts: {
    qry: service + 'qryIT'
  },
  ItemParts: {
    qry: service + 'qryITP',
    set2: service + 'set2ITP'
  },
  CurrentCost: {
    get: service + 'getCOS',
    qry: service + 'qryCOS',
    snapshot: service + 'snapshotCOS'
  },
  Availability: {
    qry: service + 'qryAVA'
  },
  Parts: {
    qry: service + 'qryPRT',
    del: service + 'delPRT',
    get: service + 'getPRT',
    set: service + 'setPRT',
    snapshot: service + 'snapshotPRT'
  },
  DocumentTypeDefaults: {
    get: service + 'getDTD',
    page: service + 'pageDTD',
    del: service + 'delDTD',
    set: service + 'setDTD'
  },
  Serial: {
    qry: service + 'qrySRL',
    snapshot: service + 'snapshotSRL'
  },
  RMSKU: {
    snapshot: service + 'snapshotRM'
  },
  SFSKU: {
    snapshot: service + 'snapshotSF'
  }
}
