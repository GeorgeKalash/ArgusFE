const service = 'BP.asmx/'

export const BusinessPartnerRepository = {

    LegalStatus: {
        qry: service + 'qryLGS',
        get: service + 'getLGS',
        set: service + 'setLGS',
        del: service + 'delLGS',
    },
    GroupLegalDocument: {
      qryGIN: service + 'qryGIN',
      getGIN: service + 'getGIN',
      setGIN: service + 'setGIN',
      delGIN: service + 'delGIN'
    },
    CategoryID: {
      qryINC: service + 'qryINC',
      getINC: service + 'getINC',
      setINC: service + 'setINC',
      delINC: service + 'delINC'
    },
    Group: {
      qryGRP: service + 'qryGRP',
      getGRP: service + 'getGRP',
      setGRP: service + 'setGRP',
      delGRP: service + 'delGRP'
    }

}
