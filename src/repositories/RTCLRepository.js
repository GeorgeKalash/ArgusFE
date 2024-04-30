const service = 'RTCL.asmx/'

export const RTCLRepository = {
  CtClientIndividual: {
    get: service + 'getKYC',
    get2: service + 'get2KYC',
    get3: service + 'get3KYC',
    set2: service + 'set2KYC',
    close: service + 'closeKYC'
  },
  ClientRelation: {
    qry: service + 'qryREL',
    set2: service + 'set2REL'
  },
  Client: {
    get: service + 'getCLI'
  }
}
