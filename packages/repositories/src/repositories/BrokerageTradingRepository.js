const service = 'BT.asmx/'

export const BrokerageTradingRepository = {
  CommodityPair: {
    qry: service + 'qryCP',
    page: service + 'pageCP',
    set: service + 'setCP',
    del: service + 'delCP',
  }
}
