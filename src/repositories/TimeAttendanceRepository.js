const service = 'TA.asmx/'

export const TimeAttendanceRepository = {
  AttendanceScheduleFilters: {
    qry: service + 'qrySD'
  },
  OvertimeProfiles: {
    page: service + 'pageOTP',
    set: service + 'setOTP',
    get: service + 'getOTP',
    del: service + 'delOTP'
  },
  PendingPunches: {
    page: service + 'pagePP',
    del: service + 'delPP'
  },
  BiometricDevices: {
    page: service + 'pageBM',
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
  ResetTV: {
    reset: service + 'resetTV',
    qry: service + 'qryTV',
    qry2: service + 'qryTV2'
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
    qry: service + 'qryFS'
  },
  DSLReason: {
    qry: service + 'qryLR'
  },
  Calendar: {
    qry: service + 'qryCA'
  },
  DayTypes: {
    page: service + 'pageDT',
    set: service + 'setDT',
    get: service + 'getDT',
    del: service + 'delDT'
  },
  AttendanceDay: {
    qry: service + 'qryAD'
  }
}
