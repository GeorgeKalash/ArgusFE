const service = 'AU.asmx/'

export const AccessControlRepository = {
  maxAccess: service + 'maxAccess',
  setBMK: service + 'setBMK',
  delBMK: service + 'delBMK',
  checkOTP: service + 'checkOTP ',
  unlockRecord: service + 'unlockRecord ',
  lockRecord: service + 'lockRecord',
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
    qry: service + 'qryROU',
    set2: service + 'set2ROU',
    set: service + 'setROU',
    del: service + 'delROU'
  },
  ModuleDeactivation: {
    qry: service + 'qryMOD',
    set2: service + 'set2MOD'
  },
  AuthorizationResourceGlobal: {
    qry: service + 'qryRGL',
    get: service + 'getRGL',
    set: service + 'setRGL'
  },
  GlobalControlAuthorizationPack: {
    set2: service + 'set2CGL'
  },
  GlobalControlAuthorizationView: {
    qry: service + 'qryCGL'
  },
  UserReleaseCode: {
    qry: service + 'qryUCO',
    set: service + 'setUCO',
    del: service + 'delUCO'
  },
  ModuleClass: {
    qry: service + 'qryRES',
    get: service + 'getRES',
    qry0: service + 'qryRES0',
    qry2: service + 'qryRES2',
    set: service + 'setRES',
    set2: service + 'set2RES'
  },
  SGControlAccess: {
    qry: service + 'qryCRL',
    set2: service + 'set2CRL'
  },
  UserSiteView: {
    qry: service + 'qryUSI',
    set2: service + 'set2USI'
  },
  NotificationLabel: {
    page: service + 'pageNLB',
    qry: service + 'qryNLB',
    get: service + 'getNLB',
    set: service + 'setNLB',
    del: service + 'delNLB'
  },
  SGReleaseCode: {
    qry: service + 'qryRCO',
    set: service + 'setRCO',
    del: service + 'delRCO'
  },
  DataAccessItem: {
    qry: service + 'qryROW',
    set2: service + 'set2ROW'
  },
  Notification: {
    qry: service + 'qryNTX',
    set: service + 'setNTX',
    get: service + 'getNTX',
    del: service + 'delNTX',
    post: service + 'postNTX'
  },
  LockedRecords: {
    qry: service + 'qryLOK',
    del: service + 'delLOK',
    get: service + 'getLOK',
    snapshot: service + 'snapshotLOK'
  },
  UserOTPQrcode: {
    secret: service + 'secretKEY'
  },
  PlantSupervisors: {
    qry: service + 'qryPLS',
    set2: service + 'set2PLS',
    verify: service + 'verifyPLS'
  }
}
