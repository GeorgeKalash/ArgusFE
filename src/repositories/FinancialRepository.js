const service = 'FI.asmx/'

export const FinancialRepository = {

  //Segment
  Segment: {
    qry: service + 'qrySEG'
  },
  ExpenseTypes:{
    qry: service + 'qryET',
    get: service + 'getET',
    set: service + 'setET',
    del: service + 'delET',
    page: service + 'pageET'
  }

}
