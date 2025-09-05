const service = 'RS.asmx/'

export const RepairRepository = {
  RepairName: {
    page: service + 'pageRNA',
    get: service + 'getRNA',
    set: service + 'setRNA',
    del: service + 'delRNA',
  }
}