const service = 'CO.asmx/'

export const CostAllocationRepository = {
  CACostTypes: {
    qry: service + 'qryTYP',
    page: service + 'pageTYP',
    get: service + 'getTYP',
    set: service + 'setTYP',
    del: service + 'delTYP'
  }
}
