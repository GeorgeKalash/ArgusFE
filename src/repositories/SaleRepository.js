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
    page: service + 'pageSZ'
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
    snapshot: service + 'snapshotCL'
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
    set: service + 'setAD'
  },
  FilterAddress: {
    snapshot: service + 'snapshotADD'
  },
  FinancialIntegrators: {
    qry: service + 'qryFII',
    set: service + 'setFII'
  },
  SATrx: {
    qry: service + 'qryTRX'
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
  }
}
