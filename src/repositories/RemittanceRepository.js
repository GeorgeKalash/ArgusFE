const service = 'RTSET.asmx/'

export const RemittanceSettingsRepository = {
  Interface: {
    qry: service + 'qryITF',
    get: service + 'getITF',
    set: service + 'setITF',
    del: service + 'delITF'
  },
  ProductMaster: {
    qry: service + 'qryPRO',
    get: service + 'getPRO',
    set: service + 'setPRO',
    del: service + 'delPRO'
  },
  Correspondent: {
    qry: service + 'qryCOR',
    get: service + 'getCOR',
    set: service + 'setCOR',
    del: service + 'delCOR'
  },
  CorrespondentCountry: {
    qry: service + 'qryCCO',
    get: service + 'getCCO',
    set: service + 'setCCO',
    del: service + 'delCCO'
  },
  CorrespondentCurrency: {
    qry: service + 'qryCCU',
    get: service + 'getCCU',
    set: service + 'setCCU',
    del: service + 'delCCU'
  }
}