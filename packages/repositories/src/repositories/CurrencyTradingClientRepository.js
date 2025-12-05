const service = 'CTCL.asmx/'

export const CurrencyTradingClientRepository = {
  Identity: {
    get: service + 'getID'
  },
  Client: {
    snapshot: service + 'snapshotCL',
    get: service + 'getCL'
  }
}
