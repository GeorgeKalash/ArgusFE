const service = 'SY.asmx/'

export const SystemRepository = {

    get2AM: service + 'get2AM',

    DocumentType: {
        qry: service + 'qryDT',
        get: service + 'getDT',
    }
}