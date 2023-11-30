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
    set2: service + 'set2CCO',
    del: service + 'delCCO'
  },
  CorrespondentCurrency: {
    qry: service + 'qryCCU',
    get: service + 'getCCU',
    set2: service + 'set2CCU',
    del: service + 'delCCU'
  },
  CorrespondentAgents: {
    qry: service + 'qryAGT',
    get: service + 'getAGT',
    set: service + 'setAGT',
    del: service + 'delAGT'
  },
  CorrespondentAgentBranches: {
    qry: service + 'qryABR',
    page: service + "pageABR",
    get: service + 'getABR',
    set: service + 'setABR',
    del: service + 'delABR'
  },
  CorrespondentExchangeMap: {
    qry: service + 'qryEXC',
    set2: service + 'set2EXC'
  }
}
