const service = 'DR.asmx/'

export const DocumentReleaseRepository = {
  
  ReleaseIndicator: {
    qry: service + 'qryIND',
    get: service + 'getIND',
    set: service + 'setIND',
    del: service + 'delIND'
  }

}
