const service = 'RTSET.asmx/'

export const RemittanceSettingsRepository = {
  Interface: {
    qry: service + 'qryITF',
    get: service + 'getITF',
    set: service + 'setITF',
    del: service + 'delITF'
  }
}