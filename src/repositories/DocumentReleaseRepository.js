const service = 'DR.asmx/'

export const DocumentReleaseRepository = {
  
  ReleaseIndicator: {
    page: service + 'pageIND',
    qry: service + 'qryIND',
    get: service + 'getIND',
    set: service + 'setIND',
    del: service + 'delIND'
  },
  ReleaseCode: {
    page: service + 'pageCOD',
    qry: service + 'qryCOD',
    get: service + 'getCOD',
    set: service + 'setCOD',
    del: service + 'delCOD'
  },
  DRGroup: {
    page: service + 'pageGRP',
    qry: service + 'qryGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  },
  GroupCode: { //DRGroupAprover
    qry: service + 'qryGCO',
    get: service + 'getGCO',
    set: service + 'setGCO',
    del: service + 'delGCO'
  },
  CharacteristicsGeneral: {
    qry: service + 'qryCHA',
    get: service + 'getCHA',
    set: service + 'setCHA',
    del: service + 'delCHA'
  },
  CharacteristicsValues:
  {
    qry: service + 'qryCHV',
    get: service + 'getCHV',
    set: service + 'setCHV',
    del: service + 'delCHV'
  },
  Class:
  {
    qry: service + 'qryCLS',
    get: service + 'getCLS',
    set: service + 'setCLS',
    del: service + 'delCLS'
  },
  ClassCharacteristics:
  {
    qry: service + 'qryCLC',
    get: service + 'getCLC',
    set: service + 'setCLC',
    del: service + 'delCLC'
  },
  ClassFunction:
  {
    qry: service + 'qryCFU',
    get: service + 'getCFU',
    set: service + 'setCFU',
    del: service + 'delCFU'
  },
  Strategy:
  {
    qry: service + 'qrySTG',
    get: service + 'getSTG',
    set: service + 'setSTG',
    del: service + 'delSTG'
  }


}
