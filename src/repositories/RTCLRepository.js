const service = 'RTCL.asmx/'

export const RTCLRepository = {
  CtClientIndividual: {
    get: service + 'get2KYC',
    set2: service + 'set2KYC'
  },
  ClientRelation: {
    qry: service + 'qryREL',
    set2: service + 'set2REL'
  },
  Client: {
    get: service + 'getCLI'
  }
}
