const service = 'GL.asmx/'

export const GeneralLedgerRepository = {
  IntegrationLogic: {
    qry: service + 'qryIL',
    page: service + 'pageIL',
    set: service + 'setIL',
    get: service + 'getIL',
    del: service + 'delIL',
    snapshot: service + 'snapshotIL'
  },

  CostCenter: {
    page: service + 'pageCC',
    qry: service + 'qryCC',
    get: service + 'getCC',
    set: service + 'setCC',
    del: service + 'delCC',
    snapshot: service + 'snapshotCC'
  },
  IntegrationPostTypes: {
    page: service + 'pageIPT',
    qry: service + 'qryIPT',
    get: service + 'getIPT',
    set: service + 'setIPT',
    del: service + 'delIPT',
    snapshot: service + 'snapshotIPT'
  },
  GLAccountGroups: {
    page: service + 'pageGRP',
    qry: service + 'qryGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  },
  CostCenterGroup: {
    page: service + 'pageCCG',
    qry: service + 'qryCCG',
    get: service + 'getCCG',
    set: service + 'setCCG',
    del: service + 'delCCG'
  },
  ChartOfAccounts: {
    snapshot: service + 'snapshotAC',
    page: service + 'pageAC',
    qry: service + 'qryAC',
    get: service + 'getAC',
    set: service + 'setAC',
    del: service + 'delAC'
  },
  JournalVoucher: {
    snapshot: service + 'snapshotJV',
    page: service + 'pageJV',
    qry: service + 'qryJV',
    get: service + 'getJV',
    set: service + 'setJV',
    post: service + 'postJV',
    del: service + 'delJV'
  },
  GeneralLedger: {
    qry: service + 'qryTRX',
    get: service + 'getTRX',
    get2: service + 'get2TRX',
    set2: service + 'set2TRX',
    set: service + 'setTRX',
    del: service + 'delTRX'
  },
  IntegrationAccounts: {
    qry: service + 'qryIA',
    set2: service + 'set2IA'
  },
  Account: {
    snapshot: service + 'snapshotAC'
  },
  IntegrationLogicDetails: {
    qry: service + 'qryID',
    page: service + 'pageID',
    get: service + 'getID',
    set: service + 'setID',
    set2: service + 'set2ID',
    del: service + 'delID'
  },
  IntegrationSystemFunction: {
    qry: service + 'qryISF',
    set2: service + 'set2ISF'
  },
  Segments: {
    qry: service + 'qrySEG',
    get: service + 'getSEG',
    set: service + 'setSEG',
    del: service + 'delSEG'
  }
}
