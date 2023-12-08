const service = 'MC.asmx/'

export const MultiCurrencyRepository = {
  ExchangeTable: {
    qry: service + 'qryEX',
    qry2: service +  "qryEX2",
    get: service + 'getEX',
    set: service + 'setEX',
    del: service + 'delEX'
  }
}
