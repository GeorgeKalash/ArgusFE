const service = 'BI.asmx/'

export const BankInterfaceRepository = {
  Currencies: {
    qry: service + 'qryBICurrencies'
  },
  Countries: {
    qry: service + 'qryBICountries'
  }
}
