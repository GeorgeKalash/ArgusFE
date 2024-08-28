const service = 'DE.asmx/'

export const DeliveryRepository = {
  Driver: {
    page: service + 'pageDRV',
    set: service + 'setDRV',
    get: service + 'getDRV',
    qry: service + 'qryDRV',
    del: service + 'delDRV'
  },
  Vehicle: {
    page: service + 'pageVEH',
    set: service + 'setVEH',
    get: service + 'getVEH',
    qry: service + 'qryVEH',
    del: service + 'delVEH'
  }
}
