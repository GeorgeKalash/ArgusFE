import SpManufacturer from 'src/pages/sp-manuf'

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
  SpManufacturer: {
    page: service + 'pageSPM',
    get: service + 'getSPM',
    set: service + 'setSPM',
    del: service + 'delSPM'
  }
}
