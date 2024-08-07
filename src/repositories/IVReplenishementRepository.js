const service = 'IR.asmx/'

export const IVReplenishementRepository = {
  ReplenishmentGroup: {
    qry: service + 'qryGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  }
}
