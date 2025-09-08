const service = 'RS.asmx/'

export const RepairAndServiceRepository = {
  RepairName: {
    page: service + 'pageRNA',
    get: service + 'getRNA',
    set: service + 'setRNA',
    del: service + 'delRNA'
  },
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
<<<<<<< HEAD:src/repositories/RepairRepository.js
  },
  JobPosition: {
    page: service + 'pagePOS',
    get: service + 'getPOS',
    set: service + 'setPOS',
    del: service + 'delPOS'
=======
>>>>>>> cc7556ead74301083a232cf5867098616f0b3b89:src/repositories/RepairAndServiceRepository.js
  }
}
