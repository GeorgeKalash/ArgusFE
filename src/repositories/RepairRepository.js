const service = 'RS.asmx/'

export const RepairRepository = {
  RepairType: {
    page: service + 'pageRT',
    get: service + 'getRT',
    set: service + 'setRT',
    del: service + 'delRT'
  },
  InspectionTemplate: {
    get2: service + 'get2ITE',
    page: service + 'pageITE',
    set2: service + 'set2ITE',
    del: service + 'delITE'
  }
}
