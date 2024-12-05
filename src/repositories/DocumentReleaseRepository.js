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
    del: service + 'delCOD',
    snapshot: service + 'snapshotCOD'
  },
  DRGroup: {
    page: service + 'pageGRP',
    qry: service + 'qryGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  },
  GroupCode: {
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
  CharacteristicsValues: {
    qry: service + 'qryCHV',
    get: service + 'getCHV',
    set: service + 'setCHV',
    del: service + 'delCHV'
  },
  Class: {
    page: service + 'pageCLS',
    qry: service + 'qryCLS',
    get: service + 'getCLS',
    set: service + 'setCLS',
    del: service + 'delCLS',
    snapshot: service + 'snapshotCLS'
  },
  ClassCharacteristics: {
    qry: service + 'qryCLC',
    get: service + 'getCLC',
    set: service + 'setCLC',
    del: service + 'delCLC'
  },
  ClassFunction: {
    qry: service + 'qryCFU',
    get: service + 'getCFU',
    set: service + 'setCFU',
    del: service + 'delCFU'
  },
  Strategy: {
    page: service + 'pageSTG',
    qry: service + 'qrySTG',
    get: service + 'getSTG',
    set: service + 'setSTG',
    del: service + 'delSTG',
    snapshot: service + 'snapshotSTG'
  },
  DocumentsOnHold: {
    qry: service + 'qryTRX',
    get: service + 'getTRX',
    set: service + 'setTRX',
    del: service + 'delTRX'
  },
  Approvals: {
    qry: service + 'qry2TRX'
  },
  StrategyCode: {
    qry: service + 'qrySCO',
    get: service + 'getSCO',
    set: service + 'setSCO',
    del: service + 'delSCO'
  },
  StrategyIndicator: {
    qry: service + 'qrySTS',
    get: service + 'getSTS',
    set: service + 'setSTS',
    set2: service + 'set2STS',
    del: service + 'delSTS'
  },
  StrategyPrereq: {
    qry: service + 'qryPRE',
    get: service + 'getPRE',
    set: service + 'setPRE',
    del: service + 'delPRE'
  },
  ApplySTG: {
    apply: service + 'applySTG'
  }
}
