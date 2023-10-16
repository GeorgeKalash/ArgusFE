const service = 'BP.asmx/'

export const BusinessPartnerRepository = {

    LegalStatus: {
        qry: service + 'qryLGS',
        get: service + 'getLGS',
        set: service + 'setLGS',
        del: service + 'delLGS',
    }

}