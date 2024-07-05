const service = 'BP.asmx/'

export const BusinessPartnerRepository = {
  LegalStatus: {
    qry: service + 'qryLGS',
    page: service + 'pageLGS',
    get: service + 'getLGS',
    set: service + 'setLGS',
    del: service + 'delLGS'
  },
  GroupLegalDocument: {
    qry: service + 'qryGIN',
    page: service + 'pageGIN',
    get: service + 'getGIN',
    set: service + 'setGIN',
    del: service + 'delGIN'
  },
  CategoryID: {
    qry: service + 'qryINC',
    get: service + 'getINC',
    page: service + 'pageINC',
    set: service + 'setINC',
    del: service + 'delINC'
  },
  Group: {
    qry: service + 'qryGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  },
  MasterData: {
    qry: service + 'qryMAS',
    get: service + 'getMAS',
    set: service + 'setMAS',
    del: service + 'delMAS',
    snapshot: service + 'snapshotMAS'
  },
  RelationTypes: {
    qry: service + 'qryRLT',
    page: service + 'pageRLT',
    get: service + 'getRLT',
    set: service + 'setRLT',
    del: service + 'delRLT'
  },
  Groups: {
    qry: service + 'qryGRP',
    page: service + 'pageGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  },
  MasterIDNum: {
    qry: service + 'qryMIN',
    page: service + 'pageMIN',
    get: service + 'getMIN',
    set: service + 'setMIN',
    del: service + 'delMIN'
  },
  Relation: {
    qry: service + 'qryREL',
    page: service + 'pageREL',
    get: service + 'getREL',
    set: service + 'setREL',
    del: service + 'delREL'
  },
  BPAddress: {
    qry: service + 'qryADD',
    get: service + 'getADD',
    set: service + 'setADD',
    del: service + 'delADD'
  },
  RoleCategory: {
    qry: service + 'qryROC',
    get: service + 'getROC',
    page: service + 'pageROC',
    set: service + 'setROC',
    del: service + 'delROC'
  },
  Role: {
    qry: service + 'qryROL',
    page: service + 'pageROL',
    get: service + 'getROL',
    set: service + 'setROL',
    del: service + 'delROL'
  }
}
