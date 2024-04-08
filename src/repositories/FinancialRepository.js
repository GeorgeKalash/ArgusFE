const service = 'FI.asmx/'

export const FinancialRepository = {

  //Segment
  Segment: {
    qry: service + 'qrySEG'
  },
  DescriptionTemplate:{
    qry: service + 'qryDTP',
    page: service + 'pageDTP',
    get: service + 'getDTP',
    set: service + 'setDTP',
    del: service + 'delDTP',
  },
  ExpenseTypes:{
    qry: service + 'qryET',
    get: service + 'getET',
    set: service + 'setET',
    del: service + 'delET',
    page: service + 'pageET',
  },
  Account:{
    qry: service + 'qryACC',
    get: service + 'getACC',
    set: service + 'setACC',
    del: service + 'delACC',
    page: service + 'pageACC',
    snapshot: service + 'snapshotACC'
  },
  Group:{
    qry: service + 'qryGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP',
    page: service + 'pageGRP',
  }
}
