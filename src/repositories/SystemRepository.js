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
    qry: service + 'qryPLT',
    get: service + 'getPLT',
    set: service + 'setPLT',
    del: service + 'delPLT'
  },
  CityDistrict: {
    qry: service + 'qryCDI',
    get: service + 'getCDI',
    set: service + 'setCDI',
    del: service + 'delCDI',
    page: service + 'pageCDI'
  },
  Address: {
    qry: service + '',
    get: service + 'getADD',
    set: service + 'setADD',
    del: service + ''
  },
  Plant: {
    qry: service + 'qryPL',
    get: service + 'getPL',
    set: service + 'setPL',
    del: service + 'delPL',
    page: service + 'pagePL'
  }
}
