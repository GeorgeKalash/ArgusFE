const service = 'RTSET.asmx/'

export const RemittanceSettingsRepository = {
  Interface: {
    qry: service + 'qryITF',
    get: service + 'getITF',
    set: service + 'setITF',
    del: service + 'delITF'
  },
  ProductMaster: {
    qry: service + 'qryPRO',
    get: service + 'getPRO',
    set: service + 'setPRO',
    del: service + 'delPRO'
  }
}