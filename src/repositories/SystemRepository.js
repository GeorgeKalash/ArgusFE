const service = 'SY.asmx/'

export const SystemRepository = {
  get2AM: service + 'get2AM',
  getLabels: service + 'qryLBL',
  KeyValueStore: service + 'qryKVS',
  ParameterDefinition: service + 'qryRP',
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
  NumberRange: {
    snapshot: service + 'snapshotNRA'
  },
  GeographicRegion: {
    qry: service + 'qryRGN',
    get: service + 'getRGN',
    set: service + 'setRGN',
    del: service + 'delRGN'
  },
  Currency: {
    qry: service + 'qryCU',
    get: service + 'getCU',
    set: service + 'setCU',
    del: service + 'delCU'
  },
  City: {
    qry: service + 'qryCIT',
    get: service + 'getCIT',
    set: service + 'setCIT',
    del: service + 'delCIT'
  },
  Country: {
    qry: service + 'qryCO',
    get: service + 'getCO',
    set: service + 'setCO',
    del: service + 'delCO'
  }
}
