const service = 'KVS.asmx/'

export const KVSRepository = {
  getLabels: service + 'qryLBL',
  getPlatformLabels: service + 'qryLBL2',
  getSMSLanguage: service + 'qryST',
  getAttachement: service + 'getAttachement'
}
