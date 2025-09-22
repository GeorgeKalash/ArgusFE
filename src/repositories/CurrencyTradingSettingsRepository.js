const service = 'CTSET.asmx/'

export const CurrencyTradingSettingsRepository = {
  CommissionType: {
    qry: service + 'qryCOM',
    page: service + 'pageCOM',
    snapshot: service + 'snapshotCOM',
    get: service + 'getCOM',
    set: service + 'setCOM',
    del: service + 'delCOM'
  },
  RelationType: {
    page: service + 'pageRT',
    snapshot: service + 'snapshotRT',
    qry: service + 'qryRT',
    get: service + 'getRT',
    set: service + 'setRT',
    del: service + 'delRT'
  },
  ExchangeRates: {
    qry: service + 'qryEX',
    get: service + 'getEX',
    set2: service + 'set2EX'
  },
  IdTypes: {
    qry: service + 'qryIDT',
    page: service + 'pageIDT',
    get: service + 'getIDT',
    set: service + 'setIDT',
    del: service + 'delIDT'
  },
  Defaults: {
    qry: service + 'qryDE',
    get: service + 'getDE',
    set2: service + 'set2DE'
  },
  IdFields: {
    qry: service + 'qryIDF',
    set2: service + 'set2IDF'
  },
  Activity: {
    qry: service + 'qryACT',
    get: service + 'getACT',
    set: service + 'setACT',
    del: service + 'delACT'
  },
  RiskLevel: {
    qry: service + 'qryRSK',
    get: service + 'getRSK',
    set: service + 'setRSK',
    del: service + 'delRSK',
    page: service + 'pageRSK',
    snapshot: service + 'snapshotRSK'
  },
  PurposeExchange: {
    qry: service + 'qryPEX',
    get: service + 'getPEX',
    set: service + 'setPEX',
    del: service + 'delPEX',
    page: service + 'pagePEX',
    snapshot: service + 'snapshotPEX'
  },
  ExchangeMap: {
    qry: service + 'qryEXM',
    get2: service + 'getEXM2',
    get: service + 'getEXM',
    set2: service + 'set2EXM'
  },
  PurposeExchangeGroup: {
    qry: service + 'qryPEG',
    get: service + 'getPEG',
    set: service + 'setPEG',
    del: service + 'delPEG',
    page: service + 'pagePEG',
    snapshot: service + 'snapshotPEG'
  },
  Yakeen: {
    get: service + 'getYakeenInformations'
  },
  Mobile: {
    get: service + 'verifyMobileOwner'
  },
  Absher: {
    get: service + 'getAbsherDCI'
  },
  PreviewImageID: {
    get: service + 'previewImageID'
  },
  ScannerImage: {
    set: service + 'saveScannerImage'
  },
  MasterDataDTD: {
    qry: service + 'qryLDT',
    page: service + 'pageLDT',
    snapshot: service + 'snapshotLDT',
    set: service + 'setLDT',
    get: service + 'getLDT',
    del: service + 'delLDT'
  }
}
