const service = 'RTBI.asmx/'

export const RemittanceBankInterface = {
  Combos: {
    qry: service + 'qryCBX'
  },
  ReceivingCountries: {
    qry: service + 'qryRVC'
  },
  PayingAgent: {
    qry: service + 'qryAGT'
  },
  Bank: {
    snapshot: service + 'snapshotBank'
  },
  InstantCashRates: {
    qry: service + 'qryICRates'
  },
  Currencies: {
    qry: service + 'qryBICurrencies'
  },
  Countries: {
    qry: service + 'qryBICountries'
  },
  DeliveryMode: {
    qry: service + 'qryBIDVRow'
  }
}
