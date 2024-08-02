const service = 'IR.asmx/'

export const IVReplenishementRepository = {
  ReplenishmentGroups: {
    qry: service + 'qryGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  }
}
