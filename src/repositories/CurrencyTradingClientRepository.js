const service = 'CTCL.asmx/'

export const CurrencyTradingClientRepository = {
  Identity: {
    get: service + 'getID'
  },
  Client: {
    get: service + 'getCL'
  }
}
