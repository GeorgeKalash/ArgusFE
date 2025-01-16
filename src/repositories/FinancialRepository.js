const service = 'FI.asmx/'

export const FinancialRepository = {
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
  FiMemo: {
    qry: service + 'qryMEM',
    page: service + 'pageMEM',
    get: service + 'getMEM',
    del: service + 'delMEM',
    post: service + 'postMEM',
    cancel: service + 'cancelMEM',
    snapshot: service + 'snapshotMEM'
  },
  CreditNote: {
    set: service + 'setCN',
    del: service + 'delCN'
  },
  DebitNote: {
    set: service + 'setDN',
    del: service + 'delDN'
  },
  ServiceBillReceived: {
    set: service + 'setSB',
    del: service + 'delSB'
  },
  ServiceInvoice: {
    set: service + 'setSI',
    del: service + 'delSI'
  },
  FinancialTransaction: {
    qry: service + 'qryTRX'
  },
  ReceiptVouchers: {
    qry: service + 'qryRV',
    get: service + 'getRV',
    set: service + 'setRV',
    del: service + 'delRV',
    page: service + 'pageRV',
    snapshot: service + 'snapshotRV',
    cancel: service + 'cancelRV',
    post: service + 'postRV',
    unpost: service + 'unpostRV'
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
  },
  PaymentVouchers: {
    qry: service + 'qryPV',
    page: service + 'pagePV',
    get: service + 'getPV',
    set2: service + 'set2PV',
    set: service + 'setPV',
    del: service + 'delPV',
    post: service + 'postPV',
    cancel: service + 'cancelPV',
    snapshot: service + 'snapshotPV',
    unpost: service + 'unpostPV'
  },
  AgingProfile: {
    qry: service + 'qryAGP',
    get: service + 'getAGP',
    set: service + 'setAGP',
    del: service + 'delAGP',
    set2: service + 'set2AGP'
  },
  FIDimension: {
    qry: service + 'qryDI',
    get: service + 'getDI',
    set: service + 'setDI',
    del: service + 'delDI'
  },
  PaymentVoucherExpenses: {
    qry: service + 'qryPVX'
  },
  PaymentVoucherCostCenters: {
    qry: service + 'qryPVC'
  },
  Apply2: {
    qry: service + 'qryAPL2'
  },
  Apply3: {
    qry: service + 'qryAPL3'
  },
  AgingLeg: {
    qry: service + 'qryAGL'
  },

  MetalReceiptVoucher: {
    set2: service + 'set2MRV',
    get: service + 'qryMTI'
  },
  MetalPaymentVoucher: {
    set2: service + 'set2MPV'
  },
  MetalTrx: {
    get: service + 'getMTX',
    del: service + 'delMTX',
    post: service + 'postMTX ',
    unpost: service + 'unpostMTX',
    qry: service + 'qryMTX',
    page: service + 'pageMTX',
    snapshot: service + 'snapshotMTX'
  }
}
