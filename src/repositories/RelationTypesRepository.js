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
    set2: service + 'set2EX'

  },
}
