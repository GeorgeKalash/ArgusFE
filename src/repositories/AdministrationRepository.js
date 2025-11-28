const service = 'AA.asmx/'

export const AdministrationRepository = {
  DocumentType: {
    qry: service + 'qryDT'
  },
  ProcessNotification: {
    qry: service + 'qryPN',
    set: service + 'set2PN'
  },
  AdTemplate:{
    qry: service + 'qryTE',
    page: service + 'pageTE',
    set: service + 'setTE',
    get: service + 'getTE',
    del: service + 'delTE'
  },
  TemplateBody: {
    qry: service + 'qryTB',
    set: service + 'setTB',
    get: service + 'getTB',
    del: service + 'delTB'
  }
}
