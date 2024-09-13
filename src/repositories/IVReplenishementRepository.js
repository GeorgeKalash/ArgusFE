const service = 'IR.asmx/'

export const IVReplenishementRepository = {
  ReplenishmentGroups: {
    qry: service + 'qryGRP',
    page: service + 'pageGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP'
  },
  IvReplenishements: {
    qry: service + 'qryHDR',
    page: service + 'pageHDR',
    get: service + 'getHDR',
    set: service + 'setHDR'
  },
  IvReplenishementsList: {
    qry: service + 'qryTRX'
  },
  GenerateIvReplenishements: {
    generate: service + 'generateTFR'
  }
}
