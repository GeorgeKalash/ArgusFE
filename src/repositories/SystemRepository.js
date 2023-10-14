const service = 'SY.asmx/'

export const SystemRepository = {

    get2AM: service + 'get2AM',
    KeyValueStore: service + 'qryKVS',
    DocumentType: {
        qry: service + 'qryDT',
        get: service + 'getDT',
        set: service + 'setDT',
        del: service + 'delDT',
    },
    DocumentTypeMap: {
        qry: service + 'qryDTM',
        get: service + 'getDTM',
        set: service + 'setDTM',
        del: service + 'delDTM',
    },
    NumberRange: {
        snapshot: service + 'snapshotNRA'
    }
}