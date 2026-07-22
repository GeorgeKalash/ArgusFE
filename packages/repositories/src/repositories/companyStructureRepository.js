const service = 'CS.asmx/'

export const companyStructureRepository = {
  Branches: {
    qry: service + 'qryBR',
    get: service + 'getBR',
    del: service + 'delBR',
    set: service + 'setBR',
    page: service + 'pageBR',
  },
  BranchLegalRef: {
    set: service + 'setBL',
    qry: service + 'qryBL',
    get: service + 'getBL',
    del: service + 'delBL'
  },
  CompanyPositions: {
    qry: service + 'qryPO',
    get: service + 'getPO',
    del: service + 'delPO',
    set: service + 'setPO',
    page: service + 'pagePO',
    snapshot: service + 'snapshotPO'
  },
  Divisions: {
    qry: service + 'qryDI',
    get: service + 'getDI',
    del: service + 'delDI',
    set: service + 'setDI',
    page: service + 'pageDI',
  },
  Departments: {
    qry: service + 'qryDE',
    get: service + 'getDE',
    del: service + 'delDE',
    set: service + 'setDE',
    page: service + 'pageDE',
    snapshot: service + 'snapshotDE'
  }
}
