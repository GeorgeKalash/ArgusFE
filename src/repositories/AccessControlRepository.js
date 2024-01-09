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
   SecurityGroup:{
        qry: service + 'qryGUS',
        set: service + 'setGUS',
        set2: service + 'set2GUS',
        del: service + 'delGUS'
   },
   Group:{
    qry: service + 'qryGRP',
}
}