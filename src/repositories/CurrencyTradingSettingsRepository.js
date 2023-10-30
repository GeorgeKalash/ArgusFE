const service = 'CTSET.asmx/'

export const CurrencyTradingSettingsRepository = {
  CommissionType: {
    qry: service + 'qryCOM',
    get: service + 'getCOM',
    set: service + 'setCOM',
    del: service + 'delCOM'
  }
}