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
  }

}
