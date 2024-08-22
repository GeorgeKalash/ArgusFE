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
  }
}
