const service = 'AU.asmx/'

export const AccessControlRepository = {

    maxAccess: service + 'maxAccess',
    setBMK: service + 'setBMK',
    delBMK: service + 'delBMK',

    NotificationGroup: {
        qry: service + 'qryNOT',
        page: service + 'pageNOT',
        get: service + 'getNOT',
        set: service + 'setNOT',
        del: service + 'delNOT'
      },
}