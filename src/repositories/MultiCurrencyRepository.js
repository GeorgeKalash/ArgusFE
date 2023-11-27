const service = 'MC.asmx/'

export const MultiCurrencyRepository = {
  ExchangeTable: {
    qry: service + 'qryEX',
    get: service + 'getEX',
    set: service + 'setEX',
    del: service + 'delEX'
  }
}
