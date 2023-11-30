const service = 'IV.asmx/'

export const InventoryRepository = {
  Site: {
    qry: service + 'qrySI',
    get: service + 'getSI',
    set: service + 'setSI',
    del: service + 'delSI'
  }
}
