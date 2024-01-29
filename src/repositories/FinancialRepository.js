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
  

}
