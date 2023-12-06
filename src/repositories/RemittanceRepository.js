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
    page: service + 'pagePRO',
    get: service + 'getPRO',
    set: service + 'setPRO',
    del: service + 'delPRO'
  },
  ProductCountries: {
    qry: service + 'qryPCO',
    set2: service + 'set2PCO'
  },
  ProductMonetaries: {
    qry: service + 'qryPMO',
    set2: service + 'set2PMO'
  },
  ProductDispersal: {
    qry: service + 'qryPDI',
    get: service + 'getPDI',
    set: service + 'setPDI',
    del: service + 'delPDI'
  },
  ProductSchedules: {
    qry: service + 'qryPSC',
    set2: service + 'set2PSC'
  },
  ProductScheduleRanges: {
    qry: service + 'qryPSR',
    set2: service + 'set2PSR'
  },
  ProductScheduleFees: {
    qry: service + 'qryPSF',
    set2: service + 'set2PSF'
  },
  ProductDispersalAgents: {
    qry: service + 'qryPDA',
    set2: service + 'set2PDA'
  },
  Correspondent: {
    qry: service + 'qryCOR',
    get: service + 'getCOR',
    set: service + 'setCOR',
    del: service + 'delCOR',
    snapshot: service + 'snapshotCOR'
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
    page: service + 'pageABR',
    get: service + 'getABR',
    set: service + 'setABR',
    del: service + 'delABR'
  },
  CorrespondentExchangeMap: {
    qry: service + 'qryEXC',
    set2: service + 'set2EXC'
  },
  CurrencyExchangeMap: {
    qry: service + 'qryEXG',
    set2: service + 'set2EXG'
  },
  CorrespondentExchangeBuyMap: {
    qry: service + 'qryEXB',
    set2: service + 'set2EXB'
  },
  UpdateExchangeRates: {
    get:  service + 'getEXB',
    qry:  service + 'qryEXG2',
    set2: service + 'set2EXB'
  }
}
