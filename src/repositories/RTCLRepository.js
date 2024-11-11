const service = 'RTCL.asmx/'

export const RTCLRepository = {
  CtClientIndividual: {
    get: service + 'getKYC',
    update: service + 'updateKYC',
    get2: service + 'get2KYC',
    get3: service + 'get3KYC',
    set2: service + 'set2KYC',
    close: service + 'closeKYC'
  },
  ClientRelation: {
    qry: service + 'qryREL',
    get: service + 'getREL',
    set2: service + 'set2REL',
    set3: service + 'set3REL'
  },
  Client: {
    get: service + 'getCLI'
  },
  ClientBalance: {
    qry: service + 'qryCBA',
    get: service + 'getCBA',
  }
}
