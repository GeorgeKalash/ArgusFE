const service = 'PS.asmx/'

export const PointofSaleRepository = {
  PosUsers: {
    qry: service + 'qryUSR',
    get: service + 'getUSR',
    set: service + 'setUSR',
    del: service + 'delUSR',
    page: service + 'pageUSR'
  },
  PosUsersPOS: {
    qry: service + 'qryPOS'
  },
  PointOfSales: {
    qry: service + 'qryPOS',
    get: service + 'getPOS',
    set: service + 'setPOS',
    del: service + 'delPOS'
  }
}
