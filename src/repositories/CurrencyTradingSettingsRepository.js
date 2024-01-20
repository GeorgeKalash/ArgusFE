const service = 'CTSET.asmx/'

export const CurrencyTradingSettingsRepository = {
  CommissionType: {
    qry: service + 'qryCOM',
    page: service + 'pageCOM',
    get: service + 'getCOM',
    set: service + 'setCOM',
    del: service + 'delCOM'
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
  IdTypes: {
    qry: service + 'qryIDT',
    page: service + 'pageIDT',
    get: service + 'getIDT',
    set: service + 'setIDT',
    del: service + 'delIDT'
  },
  Defaults: {
    qry: service + 'qryDE',
    get : service + 'getDE',
    set2: service + 'set2DE'

  },
  IdFields: {
    qry: service + 'qryIDF',
    set2: service + 'set2IDF'
  },
  Activity: {
    qry: service + 'qryACT',
    get: service + 'getACT',
    set: service + 'setACT',
    del: service + 'delACT'
  }


}
