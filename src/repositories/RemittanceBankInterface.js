const service = 'RTBI.asmx/'

export const RemittanceBankInterface = {
  Combos: {
    qryCBX: service + 'qryCBX',
    qryTerrapayCBX: service + 'qryTerrapayCBX',
    qryTerrapyBanks: service + 'qryTerrapyBanks'
  },
  ReceivingCountries: {
    qry: service + 'qryRVC'
  },
  PayingAgent: {
    qry: service + 'qryAGT'
  },
  Bank: {
    snapshot: service + 'snapshotBank'
  }
}
