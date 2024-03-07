const service = 'MC.asmx/'

export const MultiCurrencyRepository = {
  ExchangeTable: {
    qry: service + 'qryEX',
    page: service + 'pageEX',
    qry2: service +  "qryEX2",
    get: service + 'getEX',
    set: service + 'setEX',
    del: service + 'delEX'
  },
  RateType: {
    qry: service + 'qryRT',
    get: service + 'getRT',
    set: service + 'setRT',
    del: service + 'delRT',
    page: service + 'pageRT',
  },
  McExchangeMap: {
    page: service + 'pageCRT',
    del: service + 'delCRT',
    qry: service + 'qryCRT',
    get: service + 'getCRT',
    set: service + 'setCRT',
  }

}
