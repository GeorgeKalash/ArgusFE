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

  }
}
