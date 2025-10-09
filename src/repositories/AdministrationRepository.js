const service = 'AA.asmx/'

export const AdministrationRepository = {
  DocumentType: {
    qry: service + 'qryDT'
  },
  PN: {
    qryPN: service + 'qryPN',
    qryTE: service + 'qryTE',
    set2PN: service + 'set2PN'
  }
}
