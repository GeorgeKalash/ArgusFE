const service = 'CTSET.asmx/'

export const RelationTypesRepository = {
  getLabels: service + 'qryLBL',
  RelationType: {
    qry: service + 'qryRT',
    get: service + 'getRT',
    set: service + 'setRT',
    del: service + 'delRT'
  },
  UpdateExchangeRates: {
    qry: service + 'qryEX',
    get: service + 'getEX',
    set2: service + 'set2EX'

  },
}
