const service = 'PM.asmx/'

export const ProductModelingRepository = {
  Designer: {
    page: service + 'pageDSR',
    get: service + 'getDSR',
    set: service + 'setDSR',
    del: service + 'delDSR'
  }
}
