const service = 'LO.asmx/'

export const LogisticsRepository = {
  LoCollector: {
    qry: service + 'qryCOL',
    get: service + 'getCOL',
    set: service + 'setCOL',
    page: service + 'pageCOL',
    del: service + 'delCOL'
  },
  LoCarrier: {
    qry: service + 'qryCAR',
    get: service + 'getCAR',
    set: service + 'setCAR',
    page: service + 'pageCAR',
    del: service + 'delCAR'
  },
  shipment: {
    get: service + 'get2SHP',
    set2: service + 'set2SHP'
  }
}
