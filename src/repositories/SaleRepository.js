const service = 'SA.asmx/'

export const SaleRepository = {
  PriceLevel: {
    qry: service + 'qryPL',
    get: service + 'getPL',
    set: service + 'setPL',
    del: service + 'delPL',
    page: service + 'pagePL'
  },
  CommissionSchedule: {
    qry: service + 'qryCSC',
    get: service + 'getCSC',
    set: service + 'setCSC',
    del: service + 'delCSC',
    set2: service + 'set2CSC'
  },
  CommissionScheduleBracket: {
    qry: service + 'qryCSB'
  },
  SalesPerson: {
    qry: service + 'qrySP',
    get: service + 'getSP',
    set: service + 'setSP',
    del: service + 'delSP',
    page: service + 'pageSP',
    snapshot: service + 'snapshotSP'
  },
  SalesZone: {
    qry: service + 'qrySZ',
    get: service + 'getSZ',
    set: service + 'setSZ',
    del: service + 'delSZ',
    page: service + 'pageSZ',
    snapshot: service + 'snapshotSZ'
  },
  SalesTeam: {
    qry: service + 'qrySPT',
    get: service + 'getSPT',
    set: service + 'setSPT',
    del: service + 'delSPT'
  },
  Target: {
    qry: service + 'qryTGT',
    set2: service + 'set2TGT',
    get: service + 'getTGT'
  },
  TargetMonth: {
    qry: service + 'qryTGM',
    set2: service + 'set2TGM'
  },
  Client: {
    get: service + 'getCL',
    snapshot: service + 'snapshotCL',
    page: service + 'pageCL',
    set: service + 'setCL',
    del: service + 'delCL',
    preview: service + 'getCLQV'
  },
  WorkFlow: {
    graph: service + 'graph'
  },
  Sales: {
    qry: service + 'qryPR',
    get: service + 'getPR',
    set: service + 'setPR',
    del: service + 'delPR'
  },
  PosUsers: {
    qry: service + 'qrySP',
    get: service + 'getSP',
    set: service + 'setSP',
    del: service + 'delSP',
    page: service + 'pageSP'
  },
  ReturnReasons: {
    qry: service + 'qryRR',
    page: service + 'pageRR',
    get: service + 'getRR',
    set: service + 'setRR',
    del: service + 'delRR'
  },
  ClientGroups: {
    qry: service + 'qryCG',
    get: service + 'getCG',
    set: service + 'setCG',
    del: service + 'delCG',
    page: service + 'pageCG'
  },
  ReturnPolicy: {
    page: service + 'pageRPO',
    qry: service + 'qryRPO',
    get: service + 'getRPO',
    set: service + 'setRPO',
    del: service + 'delRPO'
  },
  PriceGroups: {
    page: service + 'pagePG',
    qry: service + 'qryPG',
    get: service + 'getPG',
    set: service + 'setPG',
    del: service + 'delPG'
  },
  PaymentTerms: {
    qry: service + 'qryPT',
    get: service + 'getPT',
    set: service + 'setPT',
    del: service + 'delPT',
    page: service + 'pagePT'
  },
  DocumentTypeDefault: {
    qry: service + 'qryDTD',
    get: service + 'getDTD',
    set: service + 'setDTD',
    del: service + 'delDTD',
    page: service + 'pageDTD'
  },
  DocumentType: {
    qry: service + 'qryDT'
  },
  ConsignmentSites: {
    qry: service + 'qryCCS',
    get: service + 'getCCS',
    set: service + 'setCCS',
    del: service + 'delCCS',
    page: service + 'pageCCS'
  },
  Price: {
    qry: service + 'qryCC',
    get: service + 'getCC',
    set: service + 'setCC',
    del: service + 'delCC',
    page: service + 'pageCC'
  },
  SaleZoneLevel: {
    qry: service + 'qryZOL',
    set2: service + 'set2ZOL',
    get: service + 'getZOL'
  },
  SaleTransaction: {
    qry: service + 'qryTR',
    get: service + 'getTR',
    set: service + 'setTR',
    del: service + 'delTR',
    post: service + 'postTR',
    unpost: service + 'unpostTRX',
    snapshot: service + 'snapshotTR'
  },
  SalesOrder: {
    qry: service + 'qryORD',
    page: service + 'pageORD',
    get: service + 'getORD',
    set: service + 'setORD',
    set2: service + 'set2ORD',
    del: service + 'delORD',
    close: service + 'closeORD',
    reopen: service + 'reopenORD',
    cancel: service + 'terminateORD',
    postToInvoice: service + 'transfer2ORD',
    snapshot: service + 'snapshotORD'
  },
  SalesOrderItem: {
    qry: service + 'qryORI'
  },
  ItemConvertPrice: {
    get: service + 'getICP',
    get2: service + 'getICP2'
  },
  Address: {
    qry: service + 'qryAD',
    set: service + 'setAD',
    del: service + 'delAD',
    get: service + 'getAD'
  },
  FilterAddress: {
    snapshot: service + 'snapshotADD'
  },
  FinancialIntegrators: {
    qry: service + 'qryFII',
    set: service + 'setFII'
  },
  SATrx: {
    qry: service + 'qryTRX',
    qry2: service + 'qryTRX2',
    page: service + 'pageTRX'
  },
  SalesTransaction: {
    qry: service + 'qryTR',
    snapshot: service + 'snapshotTRX',
    get: service + 'getTR',
    get2: service + 'get2TR',
    set2: service + 'set2TRX',
    del: service + 'delTR'
  },
  SalesTransactionItems: {
    qry: service + 'qryIT'
  },
  Contact: {
    contact: service + 'qryContact'
  },
  FlagTR: service + 'flagTR',
  PrintedSA: {
    printed: service + 'flagORD'
  },
  SalesInquiries: {
    qry: service + 'qryII'
  },
  DraftInvoice: {
    qry: service + 'qryDFT',
    page: service + 'pageDFT',
    page2: service + 'page2DFT',
    snapshot: service + 'snapshotDFT',
    get: service + 'getDFT',
    set2: service + 'set2DFT',
    del: service + 'delDFT',
    close: service + 'closeDFT',
    post: service + 'postDFT',
    reopen: service + 'reopenDFT'
  },

  DraftInvoiceSerial: {
    qry: service + 'qryDFS',
    get: service + 'get2DFS',
    batch: service + 'batchDFS',
    append: service + 'appendDFS',
    del: service + 'delDFS'
  },
  SalesQuotations: {
    page: service + 'pageQTN',
    qry: service + 'qryQTN',
    snapshot: service + 'snapshotQTN',
    get: service + 'getQTN',
    set2: service + 'set2QTN',
    del: service + 'delQTN',
    postQuotTrx: service + 'transfer1QTN',
    postToInvTrx: service + 'transfer2QTN',
    postToCons: service + 'transfer3QTN'
  },
  QuotationItem: {
    qry: service + 'qryQTI'
  },
  DraftReturn: {
    page: service + 'pageDRE',
    page2: service + 'page2DRE',
    snapshot: service + 'snapshotDRE',
    get: service + 'getDRE',
    set2: service + 'set2DRE',
    del: service + 'delDRE',
    close: service + 'closeDRE',
    reopen: service + 'reopenDRE',
    post: service + 'postDRE'
  },
  DraftReturnSerial: {
    qry: service + 'qryDRS',
    batch: service + 'batchDRS',
    append: service + 'appendDRS',
    del: service + 'delDRS'
  },
  LastSerialInvoice: {
    get: service + 'lastSRL',
    qry: service + 'importSRL'
  },
  InvoiceReturnBalance: {
    balance: service + 'balanceRET'
  },
  SalesSyncTrx: {
    sync: service + 'syncTRX'
  }
}
