const service = 'TA.asmx/'

export const TimeAttendanceRepository = {
  AttendanceScheduleFilters: {
    qry: service + 'qrySD'
  },
  ProcessedShiftPunches: {
    retry: service + 'retryPSP'
  },
  OvertimeProfiles: {
    page: service + 'pageOTP',
    set: service + 'setOTP',
    get: service + 'getOTP',
    del: service + 'delOTP',
    qry: service + 'qryOTP'
  },
  PendingPunches: {
    page: service + 'pagePP',
    del: service + 'delPP',
    qry: service + 'qryPP'
  },
  BiometricDevices: {
    page: service + 'pageBM',
    qry: service + 'qryBM',
    del: service + 'delBM',
    set: service + 'setBM',
    get: service + 'getBM'
  },
  DSLReasons: {
    page: service + 'pageLR',
    set: service + 'setLR',
    get: service + 'getLR',
    del: service + 'delLR'
  },
  TimeVariation: {
    reset: service + 'resetTV',
    qry: service + 'qryTV',
    qry2: service + 'qryTV2',
    snapshot: service + 'snapshotTV',
    page: service + 'pageTV',
    get: service + 'getTV',
    set: service + 'setTV',
    del: service + 'delTV',
    gen: service + 'genTV',
    close: service + 'closeTV',
    reopen: service + 'reopenTV',
    cancel: service + 'cancelTV',
    override: service + 'overrideTV'
  },
  ShitLeave: {
    page: service + 'pageLQ',
    set: service + 'setLQ',
    get: service + 'getLQ',
    del: service + 'delLQ',
    close: service + 'closeLQ',
    reopen: service + 'reopenLQ'
  },
  FlatSchedule: {
    qry: service + 'qryFS',
    qry2: service + 'qryFS2',
    copyRange: service + 'copyRangeFS',
    range: service + 'rangeFS',
    del: service + 'delRangeFS'
  },
  DSLReason: {
    qry: service + 'qryLR'
  },
  Calendar: {
    qry: service + 'qryCA'
  },
  DayTypes: {
    page: service + 'pageDT',
    qry: service + 'qryDT',
    set: service + 'setDT',
    get: service + 'getDT',
    del: service + 'delDT'
  },
  AttendanceDay: {
    qry: service + 'qryAD'
  },
  Schedule: {
    qry: service + 'qrySC'
  },
  FlatPunch: {
    qry: service + 'qryFP'
  }
}
