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
  SecurityGroupUser: {
    qry: service + 'qryGUS',
    set: service + 'setGUS',
    set2: service + 'set2GUS',
    del: service + 'delGUS'
  },
  SecurityGroup: {
    qry: service + 'qryGRP',
    page: service + 'pageGRP',
    get: service + 'getGRP',
    set: service + 'setGRP',
    del: service + 'delGRP',
    snapshotGRP: service + 'snapshotGRP'
  },
  RowAccessUserView: {
    qry: service + 'qryROU'
  },
  ModuleDeactivation: {
    qry: service + 'qryMOD',
    set2: service + 'set2MOD'
  }
}
