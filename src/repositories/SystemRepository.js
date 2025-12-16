const service = 'SY.asmx/'

export const SystemRepository = {
  mainMenu: service + 'mainMenu',
  getLabels: service + 'qryLBL',
  KeyValueStore: service + 'qryKVS',
  ParameterDefinition: service + 'qryRP',
  ReportLayout: {
    qry: service + 'qryRL',
    get: service + 'getPackRL'
  },
  DynamicDashboard: {
    qry: service + 'qryUDB',
    set2: service + 'set2UDB'
  },
  ReportLayoutObject: {
    set2: service + 'set2RLO'
  },
  ReportTemplate: {
    qry: service + 'qryRT',
    set2: service + 'set2RT'
  },
  DocumentType: {
    qry: service + 'qryDT',
    qry2: service + 'qry2DT',
    get: service + 'getDT',
    set: service + 'setDT',
    snapshot: service + 'snapshotDT',
    del: service + 'delDT'
  },
  DocumentTypeMap: {
    get: service + 'getDTM',
    set: service + 'setDTM',
    del: service + 'delDTM',
    page: service + 'pageDTM'
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
    qry2: service + 'qryCU2',
    page: service + 'pageCU',
    get: service + 'getCU',
    set: service + 'setCU',
    del: service + 'delCU',
    snapshot: service + 'snapshotCU'
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
    del: service + 'delCO',
    snapshot: service + 'snapshotCO'
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
    format: service + 'formattedADD',
    snapshot: service + 'snapshotADD'
  },
  PlantGroup: {
    qry: service + 'qryPLG',
    get: service + 'getPLG',
    set: service + 'setPLG',
    del: service + 'delPLG'
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
  Defaults: {
    qry: service + 'qryDE',
    get: service + 'getDE',
    set: service + 'set2DE'
  },
  ModuleClassRES: {
    qry: service + 'qryRES',
    snapshot: service + 'snapshotRES'
  },
  ResourceControl: {
    qry: service + 'qryResourceControls'
  },
  UserFunction: {
    get: service + 'getUFU',
    qry: service + 'qryUFU',
    set: service + 'setUFU',
    set2: service + 'set2UFU'
  },
  RecordRemarks: {
    qry: service + 'qryRMK',
    set: service + 'setRMK',
    get: service + 'getRMK',
    del: service + 'delRMK'
  },
  CompanyInfo: {
    get: service + 'getCOM',
    set: service + 'setCOM'
  },
  SystemChecks: {
    qry: service + 'qryCHK',
    get: service + 'getCHK',
    set: service + 'set2CHK'
  },
  PosUsers: {
    qry: service + 'qryUS'
  },
  TimeZone: {
    get: service + 'getTZN'
  },
  Batch: {
    snapshot: service + 'snapshotBAT',
    get: service + 'getBAT',
    set: service + 'setBAT',
    del: service + 'delBAT',
    page: service + 'pageBAT'
  },
  ETL: {
    get: service + 'getETL'
  },
  THD: {
    get: service + 'getTHD'
  },
  SMSRequest: {
    page: service + 'pageSMS'
  },
  FiscalYears: {
    page: service + 'pageFY',
    qry: service + 'qryFY',
    set: service + 'setFY',
    get: service + 'getFY',
    del: service + 'delFY'
  },
  Period: {
    qry: service + 'qryFPE'
  },
  FiscalPeriodPack: {
    set2: service + 'set2FPE'
  },
  FiscalModulePack: {
    set2: service + 'set2FMO'
  },
  FiscalModule: {
    qry: service + 'qryFMO'
  },
  GovernmentOrganization: {
    qry: service + 'qryGO',
    set: service + 'setGO',
    get: service + 'getGO',
    del: service + 'delGO'
  },
  SalePerson: {
    qry: service + 'qrySP'
  },
  PlantsSchedule: {
    set2: service + 'set2PLS',
    qry: service + 'qryPLS'
  },
  TrxDetails: {
    qry2: service + 'qryTL2',
    get: service + 'getTL'
  },
  BusinessRules: { qry: service + 'qryRUL', set: service + 'setRUL', get: service + 'getRUL', del: service + 'delRUL' },
  Rules: {
    qry: service + 'qryADR',
    set2: service + 'set2ADR'
  },
  Attachment: {
    qry: service + 'qryAT',
    set: service + 'setAT',
    set2: service + 'setAT2',
    get: service + 'getAT',
    get2: service + 'getAT2',
    del: service + 'delAT'
  },
  Folders: {
    page: service + 'pageFO',
    qry: service + 'qryFO',
    get: service + 'getFO',
    set: service + 'setFO',
    del: service + 'delFO'
  },
  ResourcePerformance: {
    page: service + 'pageTLP'
  },
  DocumentReverseReasons: {
    page: service + 'pageRER',
    get: service + 'getRER',
    set: service + 'setRER',
    del: service + 'delRER'
  },
  SystemAlerts: {
    qry: service + 'qryAA',
    arr: service + 'arrAA'
  },
  RightToWork: {
    page: service + 'qryRW',
    get: service + 'getRW',
    set: service + 'setRW',
    del: service + 'delRW'
  },
  FiscalPeriod: {
    page: service + 'pageFPT',
    get: service + 'getFPT',
    set: service + 'setFPT',
    del: service + 'delFPT',
    qry: service + 'qryFPT'
  }
}
