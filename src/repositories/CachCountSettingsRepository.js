const service = 'CCSET.asmx/'

export const CachCountSettingsRepository = {
  CcCashNotes: {
    qry: service + 'qryNOT',
    get: service + 'getNOT',
    set: service + 'setNOT',
    del: service + 'delNOT',
    page: service + 'pageNOT'
  }
}
