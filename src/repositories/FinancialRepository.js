const service = 'FI.asmx/'

export const FinancialRepository = {
  //Segment
  Segment: {
    qry: service + 'qrySEG'
  },
  DescriptionTemplate: {
    qry: service + 'qryDTP',
    page: service + 'pageDTP',
    get: service + 'getDTP',
    set: service + 'setDTP',
    del: service + 'delDTP'
  },
  ExpenseTypes: {
    qry: service + 'qryET',
    get: service + 'getET',
    set: service + 'setET',
    del: service + 'delET',
    page: service + 'pageET',
    snapshot: service + 'snapshotET'
  },
  Account: {
    qry: service + 'qryACC',
    get: service + 'getACC',
    set: service + 'setACC',
    del: service + 'delACC',
    page: service + 'pageACC',
    snapshot: service + 'snapshotACC'
  },
  Group: {
    qry: service + 'qryGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP',
    page: service + 'pageGRP'
  },
  AccountCreditLimit: {
    qry: service + 'qryACL',
    page: service + 'pageACL',
    get: service + 'getACL',
    set: service + 'setACL',
    del: service + 'delACL'
  },
  AccountCreditBalance: {
    qry: service + 'qryACB',
    page: service + 'pageACB',
    get: service + 'getACB',
    set: service + 'setACB',
    del: service + 'delACB',
    rebuild: service + 'rebuildACB'
  },
  TaxSchedules: {
    qry: service + 'qryTAX',
    page: service + 'pageTAX',
    get: service + 'getTAX',
    set: service + 'setTAX',
    del: service + 'delTAX'
  },
  TaxDetailPack: {
    qry: service + 'qryTXD',
    page: service + 'pageTXD',
    get: service + 'getTXD',
    set2: service + 'set2TXD',
    del: service + 'delTXD'
  },
  TaxCodes: {
    qry: service + 'qryTXC',
    page: service + 'pageTXC',
    get: service + 'getTXC',
    set: service + 'setTXC',
    del: service + 'delTXC'
  },
  TaxHistoryPack: {
    qry: service + 'qryTAH',
    page: service + 'pageTAH',
    get: service + 'getTAH',
    set2: service + 'set2TAH',
    del: service + 'delTAH'
  },
  FiOpeningBalance: {
    qry: service + 'qryOBA',
    page: service + 'pageOBA',
    get: service + 'getOBA',
    set: service + 'setOBA',
    del: service + 'delOBA'
  },
  ReceiptVouchers: {
    qry: service + 'qryRV',
    get: service + 'getRV',
    set: service + 'setRV',
    del: service + 'delRV',
    page: service + 'pageRV',
    snapshot: service + 'snapshotRV',
    cancel: service + 'cancelRV',
    post: service + 'postRV'
  },
  Contact: {
    qry: service + 'qryContact'
  },
  FIDocTypeDefaults: {
    qry: service + 'qryDTD',
    page: service + 'pageDTD',
    get: service + 'getDTD',
    set: service + 'setDTD',
    del: service + 'delDTD'
  },
  DimensionValue: {
    qry: service + 'qryDI',
    page: service + 'pageDI',
    get: service + 'getDI',
    set: service + 'setDI',
    del: service + 'delDI'
  }
}
