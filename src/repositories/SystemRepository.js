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
    NumberRange: {
        snapshot: service + 'snapshotNRA'
    }
}