const service = 'CTSET.asmx/'

export const CurrencyTradingSettingsRepository = {
  CommissionType: {
    qry: service + 'qryCOM',
    get: service + 'getCOM',
    set: service + 'setCOM',
    del: service + 'delCOM'
  },
  SalaryRange: {
    qry: service + 'qrySRA',
    get: service + 'getSRA',
    set: service + 'setSRA',
    del: service + 'delSRA'
  },
  SourceOfIncome: {
    qry: service + 'qrySI',
    page: service + 'qrySI',
    get: service + 'getSI',
    set: service + 'setSI',
    del: service + 'delSI'
  },
  RelationType: {
    qry: service + 'qryRT',
    get: service + 'getRT',
    set: service + 'setRT',
    del: service + 'delRT'
  },
   UpdateExchangeRates: {
    qry: service + 'qryEX',
    get: service + 'getEX',
    set2: service + 'set2EX'

  },
  Profession: {
    qry: service + 'qryPRO',
    get: service + 'getPRO',
    set: service + 'setPRO',
    del: service + 'delPRO'
  },
}
