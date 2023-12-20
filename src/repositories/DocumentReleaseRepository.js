const service = 'DR.asmx/'

export const DocumentReleaseRepository = {
  
  ReleaseIndicator: {
    page: service + 'pageIND',
    qry: service + 'qryIND',
    get: service + 'getIND',
    set: service + 'setIND',
    del: service + 'delIND'
  }

}
