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
  BiometricDevices: {
    page: service + 'pageBM',
    del: service + 'delBM',
    set: service + 'setBM',
    get: service + 'getBM'
  }
}
