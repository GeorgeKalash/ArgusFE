const service = 'RTSET.asmx/'

export const RemittanceSettingsRepository = {
  Interface: {
    qry: service + 'qryITF',
    page: service + 'pageITF',
    get: service + 'getITF',
    set: service + 'setITF',
    del: service + 'delITF'
  },
  ProductMaster: {
    qry: service + 'qryPRO',
    page: service + 'pagePRO',
    get: service + 'getPRO',
    set: service + 'setPRO',
    del: service + 'delPRO',
    snapshot: service + 'snapshotPRO'
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
    page: service + 'pageCOR',
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
    page: service + 'pageAGT',
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
  ExchangeRates: {
    get: service + 'getEXB',
    qry: service + 'qryEXG2',
    set2: service + 'set2EXB'
  },
  RtDefault: {
    qry: service + 'qryDE',
    set2: service + 'set2DE'
  },
  Profession: {
    qry: service + 'qryPFN',
    page: service + 'pagePFN',
    get: service + 'getPFN',
    set: service + 'setPFN',
    del: service + 'delPFN',
    snapshot: service + 'snapshotPFN'
  },
  ClientIndividual: {
    qry: service + 'qryCLI'
  },
  SalaryRange: {
    qry: service + 'qrySRA',
    page: service + 'pageSRA',
    get: service + 'getSRA',
    set: service + 'setSRA',
    del: service + 'delSRA'
  },
  SourceOfIncome: {
    qry: service + 'qrySI',
    page: service + 'pageSI',
    get: service + 'getSI',
    set: service + 'setSI',
    del: service + 'delSI'
  },
  CorrespondentControl: {
    qry: service + 'qryCCL',
    set: service + 'set2CCL'
  },
  InterfaceMaps: {
    qry: service + 'qryIFM',
    get: service + 'getIFM',
    set2: service + 'set2IFM'
  },
  SourceOfIncomeType: {
    qry: service + 'qrySIT',
    page: service + 'pageSIT',
    get: service + 'getSIT',
    set: service + 'setSIT',
    del: service + 'delSIT'
  },
  ProfessionGroups: {
    qry: service + 'qryPFG',
    page: service + 'pagePFG',
    get: service + 'getPFG',
    set: service + 'setPFG',
    del: service + 'delPFG'
  },
  CorrespondentGroup: {
    qry: service + 'qryCGP',
    page: service + 'pageCGP',
    get: service + 'getCGP',
    set: service + 'setCGP',
    del: service + 'delCGP'
  },
  ExtraIncome: {
    qry: service + 'qryEI',
    get: service + 'getEI',
    del: service + 'delEI',
    set: service + 'setEI'
  },
  CountryRisk: {
    qry: service + 'qryCOU',
    page: service + 'pageCOU',
    get: service + 'getCOU',
    set: service + 'setCOU',
    del: service + 'delCOU'
  }
}
