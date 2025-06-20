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
    snapshot: service + 'snapshotACC',
    snapshot2: service + 'snapshotACC2'
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
    unpost: service + 'unpostMEM',
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
    unpost: service + 'unpostRV',
    verify: service + 'verifyRV',
    unverify: service + 'unverifyRV'
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
    page2: service + 'pagePV2',
    page3: service + 'pagePV3',
    get: service + 'getPV',
    set2: service + 'set2PV',
    set: service + 'setPV',
    del: service + 'delPV',
    post: service + 'postPV',
    cancel: service + 'cancelPV',
    snapshot: service + 'snapshotPV',
    unpost: service + 'unpostPV',
    verify: service + 'verifyPV'
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
    qry: service + 'qryMTI'
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
    verify: service + 'verifyMTX',
    snapshot: service + 'snapshotMTX'
  },
  AgingDoc: {
    snapshot: service + 'snapshotAGD',
    rebuild: service + 'rebuildAGD'
  },
  BalanceTransferMultiAccounts: {
    page: service + 'pageTMA',
    get2: service + 'get2TMA',
    set2: service + 'set2TMA',
    del: service + 'delTMA',
    snapshot: service + 'snapshotTMA',
    post: service + 'postTMA',
    unpost: service + 'unpostTMA'
  },
  BalanceTransfer: {
    get: service + 'getTFR',
    del: service + 'delTFR',
    set: service + 'setTFR',
    post: service + 'postTFR ',
    unpost: service + 'unpostTFR',
    page: service + 'pageTFR',
    snapshot: service + 'snapshotTFR'
  },
  BalanceTransferSales: {
    set: service + 'setTFS'
  },
  BalanceTransferPurchases: {
    set: service + 'setTFP'
  },
  PaymentReasons: {
    qry: service + 'qryPR',
    get: service + 'getPR',
    del: service + 'delPR',
    set: service + 'setPR',
    page: service + 'pagePR',
    snapshot: service + 'snapshotPR'
  },
  ResetGLMemo: {
    reset: service + 'resetGL_Memo'
  },
  ResetGL_MTX: {
    reset: service + 'resetGL_MTX'
  },
  ResetGL_PV: {
    reset: service + 'resetGL_PV'
  },
  ResetGL_RV: {
    reset: service + 'resetGL_RV'
  },
  PaymentOrders: {
    get: service + 'getPO',
    del: service + 'delPO',
    set2: service + 'set2PO',
    page2: service + 'page2PO',
    page3: service + 'page3PO',
    snapshot: service + 'snapshotPO',
    cancel: service + 'cancelPO',
    close: service + 'closePO',
    reopen: service + 'reopenPO'
  },
  PaymentOrdersExpenses: {
    qry2: service + 'qry2POX'
  },
  PaymentOrdersCostCenters: {
    qry: service + 'qryPOC'
  }
}
