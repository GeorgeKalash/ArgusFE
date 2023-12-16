const service = 'BP.asmx/'

export const BusinessPartnerRepository = {
  LegalStatus: {
    qry: service + 'qryLGS',
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
    get: service + 'getRLT',
    set: service + 'setRLT',
    del: service + 'delRLT',
  },
  Groups: {
    qry: service + 'qryGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP',
  }
}
