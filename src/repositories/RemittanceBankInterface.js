const service = 'RTBI.asmx/'

export const RemittanceBankInterface = {
  Combos: {
    qryCBX: service + 'qryCBX',
    qryTerrapayCBX: service + 'qryTerrapayCBX',
    qryTerrapyBanks: service + 'qryTerrapyBanks',
    terrapayAccountStatus: service + 'terrapayAccountStatus'
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
    qry: service + 'qryICFees',
    get: service + 'getICFees'
  },
  exchange: {
    get: service + 'getICExchangeRates'
  },
  Agents: {
    qry: service + 'qryAgents'
  }
}
