const service = 'LO.asmx/'

export const LogisticsRepository = {

  LoCollector: {
    qry: service + 'qryCOL',
    get: service + 'getCOL',
    set: service + 'setCOL',
    page: service + 'pageCOL',
    del: service + 'delCOL'
  },
}
