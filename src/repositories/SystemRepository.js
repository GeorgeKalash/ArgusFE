const service = 'SY.asmx/'

export const SystemRepository = {

    get2AM: service + 'get2AM',
    XMLDictionary: service + 'qryXML',
    DocumentType: {
        qry: service + 'qryDT',
        get: service + 'getDT',
        set: service + 'setDT',
        del: service + 'delDT',
    },
    NumberRange: {
        snapshot: service + 'snapshotNRA'
    }
}