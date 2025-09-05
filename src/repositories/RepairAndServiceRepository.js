const service = 'RS.asmx/'

export const RepairAndServiceRepository = {
  RsLabors: {
    page: service + 'pageLBR',
    set: service + 'setLBR',
    get: service + 'getLBR',
    del: service + 'delLBR'
  }
}
