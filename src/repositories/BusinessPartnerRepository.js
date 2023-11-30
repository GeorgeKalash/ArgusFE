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
  }
}
