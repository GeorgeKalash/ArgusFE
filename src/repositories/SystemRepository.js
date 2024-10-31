const service = 'SY.asmx/'

export const SystemRepository = {
  mainMenu: service + 'mainMenu',
  getLabels: service + 'qryLBL',
  KeyValueStore: service + 'qryKVS',
  ParameterDefinition: service + 'qryRP',
  ReportLayout: service + 'qryRL',
  ReportLayoutObject: service + 'qryRLO',
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
  Default: {
    get: service + 'getDE'
  },
  Defaults: {
    qry: service + 'qryDE',
    get: service + 'getDE',
    set: service + 'set2DE'
  },
  ModuleClassRES: {
    qry: service + 'qryRES'
  },
  ResourceControl: {
    qry: service + 'qryResourceControls'
  },
  UserFunction: {
    get: service + 'getUFU',
    qry: service + 'qryUFU',
    set: service + 'setUFU'
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
  Attachment: {
    get: service + 'getAT',
    set: service + 'setAT',
    del: service + 'delAT'
  },
  SystemChecks: {
    qry: service + 'qryCHK',
    set: service + 'set2CHK'
  },
  PosUsers: {
    qry: service + 'qryUS'
  },
  TimeZone: {
    get: service + 'getTZN'
  },
  Batch: {
    snapshot: service + 'snapshotBAT'
  },
  ETL: {
    get: service + 'getETL'
  },
  THD: {
    get: service + 'getTHD'
  },
  SMSRequest: {
    qry: service + 'qrySMS'
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
  UserOTPQrcode: {
    get: service + 'getUS',
    set: service + 'setUS'
  }
}
