const service = 'SY.asmx/'

export const SystemRepository = {
  mainMenu: service + 'mainMenu',
  getLabels: service + 'qryLBL',
  KeyValueStore: service + 'qryKVS',
  ParameterDefinition: service + 'qryRP',
  ReportLayout: service + 'qryRL',
  ReportTemplate: service + 'qryRT',
  DocumentType: {
    qry: service + 'qryDT',
    get: service + 'getDT',
    set: service + 'setDT',
    snapshot: service + 'snapshotDT',
    del: service + 'delDT'
  },
  DocumentTypeMap: {
    qry: service + 'qryDTM',
    get: service + 'getDTM',
    set: service + 'setDTM',
    del: service + 'delDTM'
  },
  RelationType: {
    qry: service + 'qryRT',
    get: service + 'getRT',
    set: service + 'setRT',
    del: service + 'delRT'
  },
  NumberRange: {
    snapshot: service + 'snapshotNRA',
    qry: service + 'qryNRA',
    get: service + 'getNRA',
    set: service + 'setNRA',
    del: service + 'delNRA'
  },
  GeographicRegion: {
    qry: service + 'qryRGN',
    page: service + 'pageRGN',
    get: service + 'getRGN',
    set: service + 'setRGN',
    del: service + 'delRGN'
  },
  Currency: {
    qry: service + 'qryCU',
    page: service + 'pageCU',
    get: service + 'getCU',
    set: service + 'setCU',
    del: service + 'delCU'
  },
  City: {
    qry: service + 'qryCIT',
    page: service + 'pageCIT',
    get: service + 'getCIT',
    set: service + 'setCIT',
    del: service + 'delCIT',
    snapshot: service + 'snapshotCIT'
  },
  Country: {
    qry: service + 'qryCO',
    page: service + 'pageCO',
    get: service + 'getCO',
    set: service + 'setCO',
    del: service + 'delCO'
  },
  State: {
    qry: service + 'qryST',
    get: service + 'getST',
    set: service + 'setST',
    del: service + 'delST'
  },
  Plant: {
    snapshot: service + 'snapshotPLT',
    qry: service + 'qryPLT',
    get: service + 'getPLT',
    set: service + 'setPLT',
    del: service + 'delPLT',
    page: service + 'pagePLT'
  },
  CityDistrict: {
    qry: service + 'qryCDI',
    get: service + 'getCDI',
    set: service + 'setCDI',
    del: service + 'delCDI',
    page: service + 'pageCDI',
    snapshot: service + 'snapshotCDI'
  },
  Address: {
    qry: service + 'qryADD',
    get: service + 'getADD',
    set: service + 'setADD',
    del: service + '',
    snapshot: service + 'snapshotADD'
  },
  PlantGroup: {
    qry: service + 'qryPLG'
  },
  SMSTemplate: {
    qry: service + 'qrySMT',
    get: service + 'getSMT',
    set: service + 'setSMT',
    del: service + 'delSMT',
    page: service + 'pageSMT',
    snapshot: service + 'snapshotSMT'
  },
  SystemFunction: {
    qry: service + 'qryFUN',
    get: service + 'getFUN',
    set: service + 'setFUN',
    set2: service + 'set2FUN' // SystemFunctionPack ehich contains list of SystemFunction class items
  },
  SMSFunctionTemplate: {
    qry: service + 'qrySFT',
    set: service + 'set2SFT'
  },
  Users: {
    qry: service + 'qryUS',
    get: service + 'getUS',
    set: service + 'setUS',
    del: service + 'delUS',
    page: service + 'pageUS',
    snapshot: service + 'snapshotUS'
  },
  UserDefaults: {
    qry: service + 'qryUD',
    get: service + 'getUD',
    set: service + 'setUD'
  },
  TransactionLog: {
    qry: service + 'qryTL',
    get: service + 'getTL'
  },
  State: {
    qry: service + 'qryST',
    page: service + 'pageST',
    get: service + 'getST',
    set: service + 'setST',
    del: service + 'delST'
  },
  Default: {
    get: service + 'getDE'
  },
  Defaults: {
    qry: service + 'qryDE',
    get: service + 'getDE',
    set: service + 'set2DE'
  },
  FiscalYears: {
    qry: service + 'qryFY'
  },
  ModuleClassRES: {
    qry: service + 'qryRES'
  },
  ResourceControl: {
    qry: service + 'qryResourceControls'
  },
  UserFunction: {
    get: service + 'getUFU'
  }
}
