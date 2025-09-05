const service = 'RS.asmx/'

export const RepairRepository = {
  RepairType: {
    page: service + 'pageRT',
    get: service + 'getRT',
    set: service + 'setRT',
    del: service + 'delRT',
  }
}