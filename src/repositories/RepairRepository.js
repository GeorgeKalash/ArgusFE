import SpCategory from 'src/pages/sp-categ'

const service = 'RS.asmx/'

export const RepairRepository = {
  WorkOrderTypes: {
    page: service + 'pageWOT',
    get: service + 'getWOT',
    set: service + 'setWOT',
    del: service + 'delWOT'
  },
  RepairType: {
    page: service + 'pageRT',
    get: service + 'getRT',
    set: service + 'setRT',
    del: service + 'delRT'
  },
  SpCategory: {
    page: service + 'pageSPC',
    get: service + 'getSPC',
    set: service + 'setSPC',
    del: service + 'delSPC'
  }
}
